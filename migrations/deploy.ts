// Migrations are an early feature. Currently, they're nothing more than this
// single deploy script that's invoked from the CLI, injecting a provider
// configured from the workspace's Anchor.toml.

import { PROGRAM_ID as tokenMetadataProgram } from '@metaplex-foundation/mpl-token-metadata';
import * as anchor from '@project-serum/anchor';
import { AnchorTodoList } from '../target/types/anchor_todo_list';

module.exports = async function (provider) {
    anchor.setProvider(provider);

    const program = anchor.workspace.AnchorTodoList as anchor.Program<AnchorTodoList>;

    const [mintAuthority] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from('mint_authority')],
        program.programId
    );

    const [mint] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from('mint')],
        program.programId
    );

    const [metadata] = await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from('metadata'),
            tokenMetadataProgram.toBuffer(),
            mint.toBuffer(),
        ],
        tokenMetadataProgram
    );

    const txid = await program.methods
        .initializeMint()
        .accounts({
            user: provider.wallet.publicKey,
            mintAuthority: mintAuthority,
            mint: mint,
            metadata,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
            tokenMetadataProgram,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc();

    console.log("Initialize mint");
    console.log("Txid: %s", txid);
    console.log("Mint Account: %s", mint.toBase58());
    console.log("Metadata Account: %s", metadata.toBase58());
    console.log("Mint Authority: %s", mintAuthority.toBase58());
};
