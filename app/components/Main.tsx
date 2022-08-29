import { useWorkspace } from '../utils/workspace'
import { TodoForm } from './TodoForm'
import { TodoList } from './TodoList'

import styles from '../styles/Home.module.css'

export const Main = () => {
    const workspace = useWorkspace();

    return (
        <div className={styles.AppBody}>
            {
                workspace ?
                    <div>
                        <TodoForm {...workspace}></TodoForm>
                        <TodoList {...workspace}></TodoList>
                    </div> :
                    <span>Connect Your Wallet</span>
            }
        </div>
    )
}