import { firestore } from "@/config/firebase";
import { ResponseType, WalletType } from "@/types";
import { collection, deleteDoc, doc, setDoc } from "firebase/firestore";
import { uploadFileToCloudinary } from "./imageService";

export const createOrUpdateWallet = async (
    walletData: Partial<WalletType>
): Promise<ResponseType> => {

    try {
        let walletToSave = { ...walletData }
        if (walletData.image) {
            const imageUploadRes = await uploadFileToCloudinary(
                walletData.image,
                "wallets"
            );
            if (!imageUploadRes.success) {
                return { success: false, msg: imageUploadRes.msg || "Failed to upload wallet icon" };
            }
            walletToSave.image = imageUploadRes.data // Assuming the response contains the image

        }
        if (!walletToSave?.id) {
            walletToSave.amount = 0
            walletToSave.totalIncome = 0
            walletToSave.totalExpenses = 0
            walletToSave.created = new Date();
        }

        const walletRef = walletData?.id
            ? doc(firestore, "wallets", walletData.id)
            : doc(collection(firestore, "wallets"));
        await setDoc(walletRef, walletToSave, { merge: true }); // Use merge to update existing or create new
        return { success: true, data: { ...walletToSave, id: walletRef.id } };
    } catch (error: any) {
        console.error("Error creating or updating wallet:", error);
        return { success: false, msg: error.message };

    }

}
export const deleteWallet = async (walletId: string): Promise<ResponseType> => {

    try {
        const walletRef = doc(firestore, "wallets", walletId);
        await deleteDoc(walletRef);

        return { success: true, msg: "Wallet deleted successfully" };
    } catch (error: any) {
        console.error("Error deleting wallet:", error);
        return { success: false, msg: error.message };
        
    }
}