// #region core
use anchor_lang::prelude::*;
use puppet::cpi::accounts::SetData;
use puppet::program::Puppet;
use puppet::{self, Data};

declare_id!("HmbTLCmaGvZhKnn1Zfa1JVnp7vkMV4DYVxPLWBVoN65L");

#[program]
mod puppet_master {
    use super::*;
    pub fn pull_strings(ctx: Context<PullStrings>, data: u64) -> anchor_lang::Result<()> {
        let mut acc_iter = ctx.remaining_accounts.iter();
        let cpi_program = acc_iter.next().unwrap().to_account_info();

        let actual_pda =
            Pubkey::create_program_address(&[b"seed", &[253]], ctx.program_id).unwrap();
        msg!("actual_pda:{:?}", actual_pda);

        let cpi_accounts = SetData {
            puppet: acc_iter.next().unwrap().to_account_info(),
            endpoint: acc_iter.next().unwrap().to_account_info(),
        };
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        puppet::cpi::set_data(cpi_ctx.with_signer(&[&[b"seed", &[253]]]), data)
        // puppet::cpi::set_data(cpi_ctx, data)
    }
}

#[derive(Accounts)]
pub struct PullStrings<'info> {
    #[account(mut)]
    pub puppet: Account<'info, Data>,
    pub puppet_program: Program<'info, Puppet>,
    /// CHECK:
    pub pda: UncheckedAccount<'info>,
}
// #endregion core
