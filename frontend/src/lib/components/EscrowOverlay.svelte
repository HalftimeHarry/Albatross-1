<script>
	import { onMount } from 'svelte';
	import { crossfade, fade, fly } from 'svelte/transition';
	import { isOverlayOpen } from '/workspace/Albatross-1/frontend/src/lib/providers/overlayProvider.js';
	import signersController from '/workspace/Albatross-1/frontend/src/lib/controllers/SignersController.js';
	import MetamaskController from '/workspace/Albatross-1/frontend/src/lib/controllers/MetamaskController.js';
	import { writable } from 'svelte/store';

	let activeAccount = writable(null);

	MetamaskController.store.subscribe((state) => {
		activeAccount.set(state.activeAccount);
	});

	onMount(async () => {
		await signersController.init();
	});

	const getActiveAccount = () => {
		let currentValue;
		activeAccount.subscribe((value) => (currentValue = value));
		return currentValue;
	};

	let activeAcct = getActiveAccount();


	const { signers_store } = signersController;

	$: ({ buyer, seller, lender, inspector } = $signers_store);

	let open = true;
	isOverlayOpen.subscribe((value) => {
		open = value;
	});
	export let name;
	export let image;
	export let description;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	transition:fade
	class:bg-gray-100={open}
	class="w-screen h-screen fixed top-0 left-0 flex justify-center items-center z-10"
	on:click={() => isOverlayOpen.set(false)}
	style="pointer-events: {open ? 'all' : 'none'}"
>
	<transition>
		{#if open}
			<div
				class="bg-gray-900 text-white rounded-md px-8 py-10 relative max-w-lg"
				in:fly={{ y: 200, duration: 2000 }}
				out:fade
				on:click|stopPropagation
			>
				<button
					class="absolute top-2 right-3 text-4xl text-gray-300 hover:-translate-y-0.5 transition-transform"
					on:click={() => isOverlayOpen.set(false)}>&times;</button
				>
				<h5>{name}</h5>
				<img src={image} alt={name} />
				<p>{description}</p>
				<button
					type="button"
					class="text-gray-900 bg-gray-100 hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-500 mr-2 mb-2"
				>
					<svg
						class="w-4 h-4 mr-2 -ml-1 text-[#626890]"
						aria-hidden="true"
						focusable="false"
						data-prefix="fab"
						data-icon="ethereum"
						role="img"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 320 512"
					>
						<path
							fill="currentColor"
							d="M311.9 260.8L160 353.6 8 260.8 160 0l151.9 260.8zM160 383.4L8 290.6 160 512l152-221.4-152 92.8z"
						/>
					</svg>
					{#if activeAcct.toLowerCase() === seller.toLowerCase()}
						Seller
					{:else if activeAcct.toLowerCase() === lender.toLowerCase()}
						Lender
					{:else if activeAcct.toLowerCase() === inspector.toLowerCase()}
						Inspector
					{/if}
				</button>
			</div>
		{/if}
	</transition>
</div>
