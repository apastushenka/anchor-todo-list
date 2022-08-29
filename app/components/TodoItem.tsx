import * as anchor from '@project-serum/anchor';
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
        const pdaTodo = await todoAddress(index);

        try {
            let txid = await program.methods
                .markCompleted(new anchor.BN(index))
                .accounts({
                    user: wallet.publicKey,
                    todo: pdaTodo,
                })
                .rpc();
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