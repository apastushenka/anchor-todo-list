import * as anchor from '@project-serum/anchor';
import { Workspace } from '../utils/workspace';

import styles from '../styles/Home.module.css';

export const TodoForm = ({ program, wallet, counterAddress, todoAddress }: Workspace) => {
    const handleSubmit = (event: any) => {
        event.preventDefault()
        addTodo(event.target.message.value)
    }

    const addTodo = async (message: string) => {
        const pdaCounter = await counterAddress();

        const createTodoInstruction = async (index: any) => {
            const pdaTodo = await todoAddress(index);

            return program.methods
                .addTodo(message)
                .accounts({
                    user: wallet.publicKey,
                    counter: pdaCounter,
                    todo: pdaTodo,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .instruction();
        }

        const tx = new anchor.web3.Transaction();

        const counter = await program.account.todoCounter.fetchNullable(pdaCounter);
        if (counter) {
            const ix = await createTodoInstruction(counter.count);
            tx.add(ix);
        } else {
            let ix = await program.methods
                .initTodoList()
                .accounts({
                    user: wallet.publicKey,
                    counter: pdaCounter,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .instruction();
            tx.add(ix);

            ix = await createTodoInstruction(0);
            tx.add(ix);
        }

        try {
            let txid = await program.provider.sendAndConfirm?.(tx);
            console.log(`Transaction submitted: https://explorer.solana.com/tx/${txid}?cluster=custom&customUrl=http://localhost:8899`)
        }
        catch (e) {
            console.log("error: ", e);
            alert(JSON.stringify(e));
        }
    }

    return (
        <div>
            <form className={styles.form} onSubmit={handleSubmit}>
                <input id='message' className={styles.formField} type='text' required></input>
                <button className={styles.formButton} type='submit'>Add ToDo</button>
            </form>
        </div>
    )
}
