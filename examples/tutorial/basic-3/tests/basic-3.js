const assert = require("assert");
const anchor = require("@coral-xyz/anchor");
const { SystemProgram } = anchor.web3;

describe("basic-3", () => {
  const provider = anchor.AnchorProvider.local();

  // Configure the client to use the local cluster.
  anchor.setProvider(provider);

  it("Performs CPI from puppet master to puppet", async () => {
    const puppetMaster = anchor.workspace.PuppetMaster;
    const puppet = anchor.workspace.Puppet;

    // Initialize a new puppet account.
    const newPuppetAccount = anchor.web3.Keypair.generate();
    const tx = await puppet.methods
      .initialize()
      .accounts({
        puppet: newPuppetAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([newPuppetAccount])
      .rpc();

    let endpoint = anchor.web3.PublicKey.createProgramAddressSync(
      [Buffer.from('seed', 'utf8'), Buffer.from([253])],
      puppet.programId
    );

    // Invoke the puppet master to perform a CPI to the puppet.
    await puppetMaster.methods
      .pullStrings(new anchor.BN(111))
      .accounts({
        puppet: newPuppetAccount.publicKey,
        puppetProgram: puppet.programId,
      })
      .remainingAccounts([
        { pubkey: puppet.programId, isSigner: false, isWritable: false },
        { pubkey: newPuppetAccount.publicKey, isSigner: false, isWritable: false },
        { pubkey: endpoint, isSigner: false, isWritable: false },
      ])
      .rpc();

    // Check the state updated.
    puppetAccount = await puppet.account.data.fetch(newPuppetAccount.publicKey);
    assert.ok(puppetAccount.data.eq(new anchor.BN(111)));
  });
});
