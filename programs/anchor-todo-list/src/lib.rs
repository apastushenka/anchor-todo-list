use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

const DISCRIMINATOR_LENGTH: usize = 8;

declare_id!("8sHSzoGvcHMcgHMihBW4iocoBxzFdvgnnojkJpvdsoVh");

#[program]
pub mod anchor_todo_list {
    use super::*;

    pub fn initialize_mint(_ctx: Context<InitializeMint>) -> Result<()> {
        Ok(())
    }

    pub fn init_todo_list(ctx: Context<InitTodoList>) -> Result<()> {
        ctx.accounts.counter.count = 0;
        Ok(())
    }

    pub fn add_todo(ctx: Context<AddTodo>, message: String) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        msg!("Load counter: {:?}", AsRef::<TodoCounter>::as_ref(counter));

        let todo = Todo {
            index: counter.count,
            message,
            is_completed: false,
        };

        msg!("Save todo: {:?}", todo);
        ctx.accounts.todo.set_inner(todo);

        counter.count += 1;
        msg!(
            "Update counter: {:?}",
            AsRef::<TodoCounter>::as_ref(counter)
        );

        Ok(())
    }

    pub fn mark_completed(ctx: Context<MarkCompleted>, _index: u64) -> Result<()> {
        let todo = &mut ctx.accounts.todo;

        if todo.is_completed {
            return Ok(()); // TODO: return error?
        }

        msg!("Load todo: {:?}", AsRef::<Todo>::as_ref(todo));
        todo.is_completed = true;
        msg!("Update todo: {:?}", AsRef::<Todo>::as_ref(todo));

        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_accounts = token::MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token.to_account_info(),
            authority: ctx.accounts.mint_authority.to_account_info(),
        };

        let bump = *ctx.bumps.get("mint_authority").unwrap();
        let bump = &[bump][..];
        let seeds = &[&[b"mint_authority", bump][..]];

        let cpi_context = CpiContext::new_with_signer(cpi_program, cpi_accounts, seeds);
        token::mint_to(cpi_context, 1_000_000_000)?;

        Ok(())
    }
}

#[account]
#[derive(Debug)]
pub struct TodoCounter {
    pub count: u64,
}

impl TodoCounter {
    const LEN: usize = DISCRIMINATOR_LENGTH + 8;
}

#[account]
#[derive(Debug)]
pub struct Todo {
    pub index: u64,
    pub message: String,
    pub is_completed: bool,
}

impl Todo {
    fn len(message: &str) -> usize {
        DISCRIMINATOR_LENGTH + 8 + (4 + message.len()) + 1
    }
}

#[derive(Accounts)]
pub struct InitializeMint<'info> {
    #[account(mut)]
    user: Signer<'info>,

    #[account(
        init, payer = user, space = DISCRIMINATOR_LENGTH,
        seeds = [b"mint_authority"], bump
    )]
    /// CHECK: we don't read or write from this account
    mint_authority: AccountInfo<'info>,

    #[account(
        init, payer = user,
        seeds = [b"mint"], bump,
        mint::authority = mint_authority, mint::decimals = 9
    )]
    mint: Account<'info, Mint>,

    rent: Sysvar<'info, Rent>,
    token_program: Program<'info, Token>,
    system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitTodoList<'info> {
    #[account(mut)]
    user: Signer<'info>,

    #[account(
        init, payer = user, space = TodoCounter::LEN,
        seeds = [user.key().as_ref()], bump
    )]
    counter: Account<'info, TodoCounter>,

    system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(message: String)]
pub struct AddTodo<'info> {
    #[account(mut)]
    user: Signer<'info>,

    #[account(mut, seeds = [user.key().as_ref()], bump)]
    counter: Account<'info, TodoCounter>,

    #[account(
        init, payer = user, space = Todo::len(&message),
        seeds = [user.key().as_ref(), counter.count.to_be_bytes().as_ref()], bump
    )]
    todo: Account<'info, Todo>,

    system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(index: u64)]
pub struct MarkCompleted<'info> {
    user: Signer<'info>,

    #[account(mut, seeds = [user.key().as_ref(), index.to_be_bytes().as_ref()], bump)]
    todo: Account<'info, Todo>,

    /// CHECK: we don't read or write from this account
    #[account(seeds = [b"mint_authority"], bump)]
    mint_authority: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [b"mint"], bump,
        mint::authority = mint_authority
    )]
    mint: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = user
    )]
    token: Account<'info, TokenAccount>,

    token_program: Program<'info, Token>,
}
