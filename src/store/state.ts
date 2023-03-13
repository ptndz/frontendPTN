import {create} from 'zustand'

interface OpenModal{
    open:boolean
    setOpen:(isOpen :boolean)=>void
}

export const useStoreOpenModal = create<OpenModal>(set => ({
    open: false,
    setOpen: (isOpen :boolean) => set(state => ({ ...state,open: isOpen  }))
}))

