import * as anchor from '@project-serum/anchor';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { useEffect, useState } from 'react';
import { Workspace } from '../utils/workspace';

import styles from '../styles/Home.module.css';

type Todo = {
    message: string,
    completed: boolean,
}

export const TodoItem = ({ index, program, wallet, todoAddress }: { index: number } & Workspace) => {
    const [todo, setTodo] = useState<Todo | null>(null);

    useEffect(() => {
        async function fetchTodo() {
            const pdaTodo = await todoAddress(index);

            const update = async () => {
                const todo = await program.account.todo.fetchNullable(pdaTodo);
                if (todo) {
                    setTodo({
                        message: todo.message,
                        completed: todo.isCompleted,
                    });
                } else {
                    setTodo(null);
                }
            }

            await update();

            // TODO: use anchor subscription
            const id = program.provider.connection.onAccountChange(pdaTodo, update)
            return () => {
                program.provider.connection.removeAccountChangeListener(id)
            }
        }

        fetchTodo();
    }, [program, todoAddress, index])

    const handleClick = (event: any) => {
        event.preventDefault()
        markCompleted(index)
    }

    const markCompleted = async (index: number) => {
        const tokenProgram = anchor.Spl.token(program.provider);
        const associatedTokenProgram = anchor.Spl.associatedToken(program.provider);

        const todo = await todoAddress(index);

        const [mintAuthority] = await anchor.web3.PublicKey.findProgramAddress(
            [Buffer.from('mint_authority')],
            program.programId
        );

        const [mint] = await anchor.web3.PublicKey.findProgramAddress(
            [Buffer.from('mint')],
            program.programId
        );

        const tokenAddress = await getAssociatedTokenAddress(mint, wallet.publicKey);

        const tx = new anchor.web3.Transaction();

        const token = await tokenProgram.account.token.fetchNullable(tokenAddress);
        if (!token) {
            const ix = await associatedTokenProgram.methods
                .create()
                .accounts({
                    associatedAccount: tokenAddress,
                    authority: wallet.publicKey,
                    mint,
                    owner: wallet.publicKey,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                    tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
                    systemProgram: anchor.web3.SystemProgram.programId
                })
                .instruction();
            tx.add(ix);
        }

        const ix = await program.methods
            .markCompleted(new anchor.BN(index))
            .accounts({
                user: wallet.publicKey,
                todo,
                mintAuthority,
                mint,
                token: tokenAddress,
                tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
            })
            .instruction();
        tx.add(ix);

        try {
            const txid = await program.provider.sendAndConfirm?.(tx);
            console.log(`Transaction submitted: https://explorer.solana.com/tx/${txid}?cluster=custom&customUrl=http://localhost:8899`);
        }
        catch (e) {
            alert(JSON.stringify(e));
        }
    }

    if (!todo) {
        return <div></div>
    }

    return (
        <div>
            <button disabled={todo.completed} onClick={handleClick}>Done</button>
            <div className={styles.todo}>
                {todo.completed ?
                    <s>{todo.message}</s> :
                    todo.message
                }
            </div>
        </div >
    )
}