import { firestore } from "@/config/firebase";
import { ResponseType, TransactionType, WalletType } from "@/types";
import { collection, deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { uploadFileToCloudinary } from "./imageService";
import { createOrUpdateWallet } from "./walletService";

export const createOrUpdateTransaction = async (
    transactionData: Partial<TransactionType>
): Promise<ResponseType> => {
    try {
        const { id, type, amount, walletId, image } = transactionData;
        if (!amount || amount <= 0 || !walletId || !type) {
            return { success: false, msg: "Geçersiz işlem verisi!" };
        }
        if (id) {
            const oldTransactionSnapshot = await getDoc(doc(firestore, "transactions", id));
            const oldTransaction = oldTransactionSnapshot.data() as TransactionType;
            const shouldRevertOrignal =
                oldTransaction.type != type ||
                oldTransaction.amount != amount ||
                oldTransaction.walletId != walletId;
            if (shouldRevertOrignal) {
                let res = await revertAndUpdateWallets(oldTransaction, Number(amount), type, walletId);
                if (!res.success) return res
            }

        } else {
            let res = await updateWalletForNewTransaction(
                walletId!,
                Number(amount!),
                type
            );
            if (!res.success) return res;

        }

        if (image) {
            const imageUploadRes = await uploadFileToCloudinary(
                image,
                "transactions"
            );
            if (!imageUploadRes.success) {
                return { success: false, msg: imageUploadRes.msg || "Failed to upload image" };
            }
            transactionData.image = imageUploadRes.data // Assuming the response contains the image

        }
        const transactionRef = id
            ? doc(firestore, "transactions", id)
            : doc(collection(firestore, "transactions"));
        await setDoc(transactionRef, transactionData, { merge: true });

        return {
            success: true,
            data: { ...transactionData, id: transactionRef.id }
        };
    } catch (error: any) {
        console.error("Error creating or updating transaction:", error);
        return { success: false, msg: error.message };

    }
};

const updateWalletForNewTransaction = async (
    walletId: string,
    amount: number,
    type: string
) => {
    try {
        const walletRef = doc(firestore, "wallets", walletId);
        const walletSnapshot = await getDoc(walletRef);
        if (!walletSnapshot.exists()) {
            console.error("Cüzdan bulunamadı");
            return { success: false, msg: "Cüzdan bulunamadı" };
        }
        const walletData = walletSnapshot.data() as WalletType;
        if (type == "expense" && walletData.amount! - amount < 0) {
            return { success: false, msg: "Bakiye yetersiz" };
        }
        const updateType = type == "income" ? "totalIncome" : "totalExpenses";
        const updatedWalletAmount =
            type == "income"
                ? Number(walletData.amount) + amount
                : Number(walletData.amount) - amount;
        const updatedTotals = type == "income"
            ? Number(walletData.totalIncome) + amount
            : Number(walletData.totalExpenses) + amount;

        await updateDoc(walletRef, {
            amount: updatedWalletAmount,
            [updateType]: updatedTotals
        });
        return { success: true };
    } catch (error: any) {
        console.error("Error updating wallet for new transaction:", error);
        return { success: false, msg: error.message };

    }
}

const revertAndUpdateWallets = async (
    oldTransaction: TransactionType,
    newTransactionAmount: number,
    newTransactionType: string,
    newWalletId: string
) => {
    try {
        const orignalWalletSnapshot = await getDoc(doc(firestore, "wallets", oldTransaction.walletId));

        const orignalWallet = orignalWalletSnapshot.data() as WalletType;
        let newWalletSnapshot = await getDoc(doc(firestore, "wallets", newWalletId));

        let newWallet = newWalletSnapshot.data() as WalletType;
        const revertType = oldTransaction.type == "income" ? "totalIncome" : "totalExpenses";

        const revertIncomeExpense: number =
            oldTransaction.type == "income"
                ? -Number(oldTransaction.amount)
                : Number(oldTransaction.amount);

        const revertedWalletAmount = Number(orignalWallet.amount) + revertIncomeExpense;
        const revertedIncomeExpenseAmount = Number(orignalWallet[revertType]) - Number(oldTransaction.amount);

        if (newTransactionType == "expense") {

            if (oldTransaction.walletId == newWalletId && revertedWalletAmount < newTransactionAmount) {
                return { success: false, msg: "Seçilen cüzdanın bakiyesi yetersiz" };
            }

            if (newWallet.amount! < newTransactionAmount) {
                return { success: false, msg: "Seçilen cüzdanın bakiyesi yetersiz" };
            }

        }

        await createOrUpdateWallet({
            id: oldTransaction.walletId,
            amount: revertedWalletAmount,
            [revertType]: revertedIncomeExpenseAmount
        })
        //revert complete
        //!--------------------------------------------------------------------------
        newWalletSnapshot = await getDoc(doc(firestore, "wallets", newWalletId));

        newWallet = newWalletSnapshot.data() as WalletType;

        const updateType = newTransactionType == "income" ? "totalIncome" : "totalExpenses";

        const updatedTransactionAmount: number = newTransactionType == "income"
            ? Number(newTransactionAmount)
            : -Number(newTransactionAmount);

        const newWalletAmount = Number(newWallet.amount) + updatedTransactionAmount;
        const newIncomeExpenseAmount = Number(newWallet[updateType]! + Number(newTransactionAmount));
        await createOrUpdateWallet({
            id: newWalletId,
            amount: newWalletAmount,
            [updateType]: newIncomeExpenseAmount
        })

        return { success: true };
    } catch (error: any) {
        console.error("Error updating wallet for new transaction:", error);
        return { success: false, msg: error.message };

    }
}

export const deleteTransaction = async (
    transactionId: string,
    walletId: string
) => {
    try {
        const transactionRef = doc(firestore, "transactions", transactionId);
        const transactionSnapshot = await getDoc(transactionRef);

        if (!transactionSnapshot.exists()) {
            return { success: false, msg: "İşlem bulunamadı" };
        }
        const transactionData = transactionSnapshot.data() as TransactionType;
        const transactionType = transactionData?.type;
        const transactionAmount = transactionData?.amount;

        //fetch wallet
        const walletSnapshot = await getDoc(doc(firestore, "wallets", walletId));
        const walletData = walletSnapshot.data() as WalletType;

        // check fields
        const updateType = transactionType == "income" ? "totalIncome" : "totalExpenses";
        const newWalletAmount =
            walletData?.amount! -
            (transactionType == "income" ? transactionAmount : -transactionAmount);

        const newIncomeExpenseAmount = walletData[updateType]! - transactionAmount;
        // masrafları ve cüzdan bakiyesi sıfırın altına düşebilirse silme islemi yapamaz
        if (transactionType == "expense" && newWalletAmount < 0) {
             return { success: false, msg: "Bu işlemi silemezsiniz" };
        }

        await createOrUpdateWallet({
            id: walletId,
            amount: newWalletAmount,
            [updateType]: newIncomeExpenseAmount
        })

        await deleteDoc(transactionRef);
        return { success: true };
    } catch (error: any) {
        console.error("Error updating wallet for new transaction:", error);
        return { success: false, msg: error.message };

    }
}