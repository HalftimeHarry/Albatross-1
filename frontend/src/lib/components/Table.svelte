<script>
	import { onMount } from 'svelte';
	import EthersProvider from '/workspace/Albatross-1/frontend/src/lib/providers/ethersProvider.js';
	import EscrowController from '/workspace/Albatross-1/frontend/src/lib/controllers/EscrowController.js';
	import { ethers } from 'ethers';

	export let rows;

	const ethersProvider = new EthersProvider();

	const { escrow_store } = EscrowController;

	$: ({ inspector, lender, dao, seller, price, contributions, inspectionStatus } = $escrow_store);

	function shortenAddress(address) {
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	}

	let dataReady = false;

	let ethToUsdRate;

	onMount(async () => {
		await EscrowController.init();

		const response = await fetch(
			'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
		);
		const data = await response.json();
		ethToUsdRate = data.ethereum.usd;

		// Set dataReady to true once the data is fetched
		dataReady = true;

		const updatedRows = [];
		let nftID = 1;
		for (const row of rows) {
			const lenderApproval = await getApprovalStatus(nftID, $escrow_store.lender);
			const inspectorApproval = await getApprovalStatus(nftID, $escrow_store.inspector);
			const daoApproval = await getApprovalStatus(nftID, $escrow_store.dao);
			const sellerApproval = await getApprovalStatus(nftID, $escrow_store.seller);
			const price = await ethersProvider.escrowContract.getPurchasePrice(nftID);
			const contributions = await ethersProvider.escrowContract.getContributions(nftID);
			const inspectionStatus = await ethersProvider.escrowContract.getInspectionStatus(nftID);
			updatedRows.push({
				...row,
				nftID,
				lenderApproval,
				inspectorApproval,
				daoApproval,
				sellerApproval,
				price,
				contributions,
				inspectionStatus
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

<div class="grid grid-cols-7 justify-center font-semibold mb-4 uppercase">
	<div class="col-span-1" />
	<div class="col-span-2 text-right mt-4">Who Has Signed off on franchise</div>
	<div class="col-span-1" />
	<div class="col-span-1" />
	<div class="col-span-1" />
	<div class="col-span-6 text-right">Details</div>
	<div class="col-span-1" />
</div>

<table class="table w-full">
	<!-- head -->
	<thead>
		<tr>
			<th />
			<th>Franchise</th>
			<th>Lender <br />({shortenAddress(lender)})</th>
			<th>DAO <br />({shortenAddress(dao)})</th>
			<th>Seller <br />({shortenAddress(seller)})</th>
			<th>Purchase Price <br />{price}</th>
			<th>Current Contributions<br />{contributions}</th>
			<th>Inspection Status <br />({shortenAddress(inspector)})</th>
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
						class={row.lenderApproval ? 'fas fa-check text-green-500' : 'fas fa-times text-red-500'}
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
				{#if dataReady}
					<td
						>{row.price
							? (ethers.utils.formatEther(row.price) * ethToUsdRate).toFixed(2) + ' USD'
							: 'N/A'}</td
					>
					<td
						>{row.contributions
							? (ethers.utils.formatEther(row.contributions) * ethToUsdRate).toFixed(2) + ' USD'
							: 'N/A'}</td
					>
				{:else}
					<td colspan="2" class="text-center">
						<div class="spinner" />
					</td>
				{/if}
				<td>
					<i
						class={row.inspectionStatus
							? 'fas fa-check text-green-500'
							: 'fas fa-times text-red-500'}
					/>
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	.spinner {
		border: 4px solid rgba(0, 0, 0, 0.1);
		width: 36px;
		height: 36px;
		border-radius: 50%;
		border-left-color: #09f;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
