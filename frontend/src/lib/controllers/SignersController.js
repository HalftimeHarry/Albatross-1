import SignersProvider from "/workspace/Albatross-1/frontend/src/lib/providers/signersProvider.js";
import { writable } from "svelte/store";

const baseState = {
    owner: "loading owner...",
    lender: "loading lender...",
    inspector: "loading inspector..."
}


class SignersController { 
    #signersStore=writable({...baseState})
  
    constructor() {
        this.signers_store = {
            subscribe: this.#signersStore.subscribe
        }
    }
      
    async init() {
        this.signersProvider = new SignersProvider();
        this.#getSigners();
    }
  
    async #getSigners() {
        const owner = await this.signersProvider?.escrowContract.getDulliger();
        const lender = await this.signersProvider?.escrowContract.getDulligie();
        const inspector = await this.signersProvider?.escrowContract.getVendor();
        this.#signersStore.update(s => ({ ...s, owner, lender, inspector }))
    }

}

export default new SignersController();
