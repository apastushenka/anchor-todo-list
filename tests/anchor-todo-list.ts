import { Metadata, PROGRAM_ID as tokenMetadataProgram, TokenStandard } from '@metaplex-foundation/mpl-token-metadata';
import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import * as assert from 'assert';
import { AnchorTodoList } from '../target/types/anchor_todo_list';

describe('anchor-todo-list', async () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.AnchorTodoList as Program<AnchorTodoList>;
    const tokenProgram = anchor.Spl.token(provider);
    const associatedTokenProgram = anchor.Spl.associatedToken(provider);

    const [mintAuthorityAddress] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from('mint_authority')],
        program.programId
    );

    const [mintAddress] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from('mint')],
        program.programId
    );

    const [metadataAddress] = await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from('metadata'),
            tokenMetadataProgram.toBuffer(),
            mintAddress.toBuffer(),
        ],
        tokenMetadataProgram
    );

    const tokenAddress = await getAssociatedTokenAddress(mintAddress, provider.wallet.publicKey);

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

    const testMarkCompleted = async (index: number, tokenAmount: number) => {
        const todoPda = await findTodoPda(provider.wallet.publicKey, index);

        await program.methods
            .markCompleted(new anchor.BN(index))
            .accounts({
                user: provider.wallet.publicKey,
                todo: todoPda,
                mintAuthority: mintAuthorityAddress,
                mint: mintAddress,
                token: tokenAddress,
                tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
            })
            .rpc();

        const todo = await program.account.todo.fetch(todoPda);
        assert.equal(todo.isCompleted, true);

        const token = await tokenProgram.account.token.fetch(tokenAddress);
        assert.deepStrictEqual(token.authority, provider.wallet.publicKey);
        assert.deepStrictEqual(token.mint, mintAddress);
        assert.equal(token.amount, tokenAmount);
    };

    it('can initialize mint', async () => {
        await program.methods
            .initializeMint()
            .accounts({
                user: provider.wallet.publicKey,
                mintAuthority: mintAuthorityAddress,
                mint: mintAddress,
                metadata: metadataAddress,
                systemProgram: anchor.web3.SystemProgram.programId,
                tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
                tokenMetadataProgram,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            })
            .rpc();

        const mint = await tokenProgram.account.mint.fetch(mintAddress);
        assert.deepStrictEqual(mint.mintAuthority, mintAuthorityAddress);
        assert.equal(mint.decimals, 9);

        const metadata = await Metadata.fromAccountAddress(provider.connection, metadataAddress);
        assert.equal(metadata.mint.toBase58(), mintAddress.toBase58());
        assert.equal(metadata.updateAuthority.toBase58(), mintAuthorityAddress.toBase58());
        assert.equal(metadata.data.symbol, 'TODO\x00\x00\x00\x00\x00\x00');
        assert.equal(metadata.tokenStandard, TokenStandard.Fungible);
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

    it('can create associated token account', async () => {
        await associatedTokenProgram.methods
            .create()
            .accounts({
                associatedAccount: tokenAddress,
                authority: provider.wallet.publicKey,
                mint: mintAddress,
                owner: provider.wallet.publicKey,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
                systemProgram: anchor.web3.SystemProgram.programId
            })
            .rpc();

        const token = await tokenProgram.account.token.fetch(tokenAddress);
        assert.deepStrictEqual(token.authority, provider.wallet.publicKey);
        assert.deepStrictEqual(token.mint, mintAddress);
        assert.equal(token.amount, 0);
    });

    it('can mark todo completed', async () => {
        await testMarkCompleted(0, 1_000_000_000);
    });

    it('can mark todo completed twice', async () => {
        await testMarkCompleted(0, 1_000_000_000);
    });
});
