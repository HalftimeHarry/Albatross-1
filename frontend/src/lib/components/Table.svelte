<script>
	import { onMount } from 'svelte';
	import EthersProvider from '/workspace/Albatross-1/frontend/src/lib/providers/ethersProvider.js';
	import EscrowController from '/workspace/Albatross-1/frontend/src/lib/controllers/EscrowController.js';

	export let rows;

	const ethersProvider = new EthersProvider();

	const { escrow_store } = EscrowController;

	$: ({ inspector, lender, dao, seller } = $escrow_store);

	function shortenAddress(address) {
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	}

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
		return status;
	}
</script>

<div class="text-black" style="display: none">
	Lender |{shortenAddress(lender)} | Inspector |{shortenAddress(inspector)} | DAO |{shortenAddress(
		dao
	)} | Seller |{shortenAddress(seller)}
</div>
<div class="grid grid-cols-3 justify-center font-semibold mb-4 uppercase">
	<div class="col-span-1" />
	<div class="col-span-1 text-right">Approvals</div>
	<div class="col-span-1" />
</div>
<table class="table w-full">
	<!-- head -->
	<thead>
		<tr>
			<th />
			<th>Franchise</th>
			<th>Inspector</th>
			<th>Lender</th>
			<th>DAO</th>
			<th>Seller</th>
		</tr>
	</thead>
	<tbody>
		{#each rows as row}
			<!-- row -->
			<tr>
				<th>{row.id}</th>
				<td>{row.name}</td>
				<td
					><i
						class={row.inspectorApproval ? 'fas fa-check text-green-500' : 'fas fa-times text-red-500'}
					/></td
				>
				<td
					><i
						class={row.lenderApproval
							? 'fas fa-check text-green-500'
							: 'fas fa-times text-red-500'}
					/></td
				>
				<td
					><i
						class={row.daoApproval ? 'fas fa-check text-green-500' : 'fas fa-times text-red-500'}
					/></td
				>
				<td
					><i
						class={row.sellerApproval ? 'fas fa-check text-green-500' : 'fas fa-times text-red-500'}
					/></td
				>
			</tr>
		{/each}
	</tbody>
</table>
