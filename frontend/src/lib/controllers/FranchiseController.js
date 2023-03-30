import EthersProvider from "/workspace/Albatross-1/frontend/src/lib/providers/ethersProvider.js";
import { writable } from "svelte/store";


const baseState = {
  totalSupply: [],
  nfts: []
}

class FranchiseController{
  #franchiseStore=writable({...baseState})
  
  constructor() {
    this.franchise_store={
      subscribe:this.#franchiseStore.subscribe
    }
  }

  async init() {
    this.ethersProvider = new EthersProvider();
    this.#getTotalSupply();
    this.#getTokenURI();
  }

  async #getTotalSupply(){
    const totalSupply = await this.ethersProvider?.franchiseContract.getTotalSupply();
    this.#franchiseStore.update(s => ({ ...s, totalSupply }))
  }

  async #getTokenURI() {
    const nfts = await this.ethersProvider?.franchiseContract.getTokenURI();
    this.#franchiseStore.update(s => ({ ...s, nfts }))
  }

}

export default new FranchiseController();