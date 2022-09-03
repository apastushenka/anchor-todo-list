import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { AnchorTodoList } from '../target/types/anchor_todo_list';
import * as assert from 'assert'

describe('anchor-todo-list', async () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.AnchorTodoList as Program<AnchorTodoList>;

    const findCounterPda = async (publicKey: anchor.web3.PublicKey) => {
        const [counterPda, _] = await anchor.web3.PublicKey.findProgramAddress(
            [
                publicKey.toBuffer(),
            ],
            program.programId
        );

        return counterPda;
    }

    const findTodoPda = async (publicKey: anchor.web3.PublicKey, index: number) => {
        const [todoPda, _] = await anchor.web3.PublicKey.findProgramAddress(
            [
                publicKey.toBuffer(),
                new anchor.BN(index).toArrayLike(Buffer, 'be', 8),
            ],
            program.programId
        );

        return todoPda;
    }

    it('can initialize mint', async () => {
        const [mintAuthorityPda] = await anchor.web3.PublicKey.findProgramAddress(
            [
                Buffer.from('mint_authority')
            ],
            program.programId
        );

        const [mintPda] = await anchor.web3.PublicKey.findProgramAddress(
            [
                Buffer.from('mint')
            ],
            program.programId
        );

        await program.methods
            .initializeMint()
            .accounts({
                user: provider.wallet.publicKey,
                mintAuthority: mintAuthorityPda,
                mint: mintPda,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .rpc();

        const tokenProgram = anchor.Spl.token(provider);
        const mint = await tokenProgram.account.mint.fetch(mintPda);

        assert.deepStrictEqual(mint.mintAuthority, mintAuthorityPda);
        assert.equal(mint.decimals, 0);
    });

    it('can initialize todo list', async () => {
        const counterPda = await findCounterPda(provider.wallet.publicKey);

        await program.methods
            .initTodoList()
            .accounts({
                user: provider.wallet.publicKey,
                counter: counterPda,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .rpc();

        const counter = await program.account.todoCounter.fetch(counterPda);

        assert.equal(counter.count, 0);
    });

    it('can add a new todo', async () => {
        const counterPda = await findCounterPda(provider.wallet.publicKey);
        const todoPda = await findTodoPda(provider.wallet.publicKey, 0);

        await program.methods
            .addTodo('todo')
            .accounts({
                user: provider.wallet.publicKey,
                counter: counterPda,
                todo: todoPda,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .rpc();

        const todo = await program.account.todo.fetch(todoPda);
        const counter = await program.account.todoCounter.fetch(counterPda);

        assert.equal(todo.index, 0);
        assert.equal(todo.message, 'todo');
        assert.equal(todo.isCompleted, false);
        assert.equal(counter.count, 1);
    })

    it('can mark todo completed', async () => {
        const todoPda = await findTodoPda(provider.wallet.publicKey, 0);

        await program.methods
            .markCompleted(new anchor.BN(0))
            .accounts({
                user: provider.wallet.publicKey,
                todo: todoPda,
            })
            .rpc();

        const todo = await program.account.todo.fetch(todoPda);
        assert.equal(todo.isCompleted, true);
    })
});
