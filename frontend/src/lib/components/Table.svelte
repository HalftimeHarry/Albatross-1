<script>
	import { onMount } from 'svelte';
	import EthersProvider from '/workspace/Albatross-1/frontend/src/lib/providers/ethersProvider.js';
	import EscrowController from '/workspace/Albatross-1/frontend/src/lib/controllers/EscrowController.js';

	export let rows;

	const ethersProvider = new EthersProvider();

	const { escrow_store } = EscrowController;

	$: ({ inspector, lender, dao, seller } = $escrow_store);

	onMount(async () => {
		await EscrowController.init();

		const updatedRows = [];
		let nftID = 1;
		for (const row of rows) {
			const lenderApproval = await getApprovalStatus(nftID, $escrow_store.lender);
			const inspectorApproval = await getApprovalStatus(nftID, $escrow_store.inspector);
			const daoApproval = await getApprovalStatus(nftID, $escrow_store.dao);
			const sellerApproval = await getApprovalStatus(nftID, $escrow_store.seller);
			updatedRows.push({
				...row,
				nftID,
				lenderApproval,
				inspectorApproval,
				daoApproval,
				sellerApproval
			});
			nftID++;
		}
		rows = updatedRows;
	});

	async function getApprovalStatus(nftID, inspector) {
		const status = await ethersProvider?.escrowContract.getApprovalStatus(nftID, inspector);
		console.log(status);
		return status;
	}
</script>

{inspector}
{lender}
{dao}
{seller}

<table class="table w-full">
	<!-- head -->
	<thead>
		<tr>
			<th />
			<th>Name</th>
			<th>Lender Approval</th>
			<th>Inspector Approval</th>
			<th>DAO Approval</th>
			<th>Seller Approval</th>
		</tr>
	</thead>
	<tbody>
		{#each rows as row}
			<!-- row -->
			<tr>
				<th>{row.id}</th>
				<td>{row.name}</td>
				<td>{row.lenderApproval}</td>
				<td>{row.inspectorApproval}</td>
				<td>{row.daoApproval}</td>
				<td>{row.sellerApproval}</td>
			</tr>
		{/each}
	</tbody>
</table>
