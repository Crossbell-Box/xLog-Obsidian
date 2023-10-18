import { ipfsUploadFile } from 'crossbell/ipfs'

export function uploadFile(file: File | Blob) {
	return ipfsUploadFile(file)
}

export function ipfsUrlToHttpUrl(url: string) {
	return url.replace('ipfs://', 'https://ipfs.4everland.xyz/ipfs/')
}
