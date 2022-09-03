// Migrations are an early feature. Currently, they're nothing more than this
// single deploy script that's invoked from the CLI, injecting a provider
// configured from the workspace's Anchor.toml.

import * as anchor from '@project-serum/anchor';
import { AnchorTodoList } from '../target/types/anchor_todo_list';

module.exports = async function (provider) {
    anchor.setProvider(provider);

    const program = anchor.workspace.AnchorTodoList as anchor.Program<AnchorTodoList>;

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

    const txid = await program.methods
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

    console.log("Initialize mint");
    console.log("Txid: %s", txid);
    console.log("Mint: %s", mintPda.toBase58());
    console.log("Mint authority: %s", mintAuthorityPda.toBase58());
};
