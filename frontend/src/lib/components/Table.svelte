<script>
	export let name;
	export let area;
	export let nftID;
	export let rows;
</script>

<table class="table w-full">
	<!-- head -->
	<thead>
		<tr>
			<th />
			<th>Name</th>
			<th>Area</th>
		</tr>
	</thead>
	<tbody>
		{#each rows as row}
			<!-- row -->
			<tr>
				<th>{row.id}</th>
				<td>{row.name}</td>
				<td>{row.area}</td>
			</tr>
		{/each}
	</tbody>
</table>
