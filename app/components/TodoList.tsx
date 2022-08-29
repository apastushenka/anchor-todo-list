import { useEffect, useState } from 'react';
import { Workspace } from '../utils/workspace';
import { TodoItem } from './TodoItem';

import styles from '../styles/Home.module.css';

export const TodoList = (workspace: Workspace) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const { program, counterAddress } = workspace;

        async function fetchCounter() {
            const pdaCounter = await counterAddress();

            const update = async () => {
                let counter = await program.account.todoCounter.fetchNullable(pdaCounter);
                setCount(counter?.count.toNumber() ?? 0)
            }

            await update();

            // TODO: use anchor subscription
            const id = program.provider.connection.onAccountChange(pdaCounter, update);
            return () => {
                program.provider.connection.removeAccountChangeListener(id);
            }
        }

        fetchCounter();
    }, [workspace])

    const todos = []
    for (let i = 0; i < count; i++) {
        todos.push(<TodoItem key={i} index={i} {...workspace}></TodoItem>)
    }

    return (
        <div className={styles.todoList}>{todos}</div>
    )
}
