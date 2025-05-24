const { query } = require("../config/db");

async function migrate() {
	let sql = `
        ALTER TABLE IF EXISTS public.policies
        ALTER COLUMN policy_num DROP NOT NULL;

    ALTER TABLE IF EXISTS public.policies
        ALTER COLUMN start_date DROP NOT NULL;

    ALTER TABLE IF EXISTS public.policies
        ALTER COLUMN end_date DROP NOT NULL;

    ALTER TABLE IF EXISTS public.policies
        ALTER COLUMN term_year DROP NOT NULL;

    ALTER TABLE IF EXISTS public.policies
        ALTER COLUMN premium_pay_term DROP NOT NULL;

    ALTER TABLE IF EXISTS public.policies
        ALTER COLUMN plan_name DROP NOT NULL;

    ALTER TABLE IF EXISTS public.policies
        ALTER COLUMN payment_mode DROP NOT NULL;

    ALTER TABLE IF EXISTS public.policies
        ALTER COLUMN insurance_company_name DROP NOT NULL;

    ALTER TABLE IF EXISTS public.policies
        ALTER COLUMN policy_type DROP NOT NULL;

    ALTER TABLE IF EXISTS public.policies
        ALTER COLUMN net_primium DROP NOT NULL;

    ALTER TABLE IF EXISTS public.policies
        ALTER COLUMN gst_percent DROP NOT NULL;

    ALTER TABLE IF EXISTS public.policies
        ALTER COLUMN total_premium DROP NOT NULL;
    `;
	await query(sql);
}

migrate()
	.then(() => {
		console.log("Migration complete");
	})
	.catch((err) => {
		console.log("Migration failed");
		console.log(err);
	});
