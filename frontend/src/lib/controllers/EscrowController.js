import EthersProvider from "/workspace/Albatross-1/frontend/src/lib/providers/ethersProvider.js";
import { writable } from "svelte/store";


const baseState={
  eadd: "loading nft address..."
}

class EscrowController{
  #escrowStore=writable({...baseState})
  
  constructor() {
    this.escrow_store={
      subscribe:this.#escrowStore.subscribe
    }
  }

  async init() {
    this.ethersProvider = new EthersProvider();
    this.#nftAddress();
  }
  
  async #nftAddress(){
    const eadd = await this.ethersProvider?.escrowContract.getEadd();
    this.#escrowStore.update(s => ({...s, eadd }))
  }

}

export default new EscrowController();
