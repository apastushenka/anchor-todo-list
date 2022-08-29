import { NextPage } from 'next'
import Head from 'next/head'
import { AppBar } from '../components/AppBar'
import { Main } from '../components/Main'
import WalletContextProvider from '../components/WalletContextProvider'

import styles from '../styles/Home.module.css'

const Home: NextPage = (props) => {
	return (
		<div className={styles.App}>
			<Head>
				<title>ToDo List</title>
				<meta
					name="description"
					content="ToDo List"
				/>
			</Head>
			<WalletContextProvider>
				<AppBar />
				<Main />
			</WalletContextProvider >
		</div >
	);
}

export default Home