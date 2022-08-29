import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { AnchorWallet, useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { AnchorTodoList, IDL } from '../idl/anchor_todo_list';
import idl from '../idl/anchor_todo_list.json';

const programID = new anchor.web3.PublicKey(idl.metadata.address)

export type Workspace = {
    program: Program<AnchorTodoList>;
    wallet: AnchorWallet;
    counterAddress: () => Promise<anchor.web3.PublicKey>;
    todoAddress: (index: number | anchor.BN) => Promise<anchor.web3.PublicKey>;
}

export const useWorkspace = (): Workspace | undefined => {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();

    let provider;
    let program;
    if (wallet) {
        provider = new anchor.AnchorProvider(
            connection,
            wallet,
            anchor.AnchorProvider.defaultOptions()
        );

        program = new anchor.Program(IDL, programID, provider);

        const counterAddress = async () => {
            const [pda] = await anchor.web3.PublicKey.findProgramAddress(
                [wallet.publicKey.toBuffer()],
                programID
            );
            return pda;
        }

        const todoAddress = async (index: number | anchor.BN) => {
            const ind = index instanceof anchor.BN ? index : new anchor.BN(index);
            const [pda] = await anchor.web3.PublicKey.findProgramAddress(
                [
                    wallet.publicKey.toBuffer(),
                    ind.toArrayLike(Buffer, 'be', 8),
                ],
                programID
            );

            return pda;
        }

        return { program, wallet, counterAddress, todoAddress };
    }
}