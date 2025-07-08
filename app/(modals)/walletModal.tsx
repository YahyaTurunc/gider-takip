import BackButton from '@/components/BackButton'
import Button from '@/components/Button'
import Header from '@/components/Header'
import ImageUpload from '@/components/ImageUpload'
import Input from '@/components/Input'
import ModalWrapper from '@/components/ModalWrapper'
import Typo from '@/components/Typo'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { useAuth } from '@/contexts/authContext'
import { createOrUpdateWallet, deleteWallet } from '@/services/walletService'
import { WalletType } from '@/types'
import { scale, verticalScale } from '@/utils/styling'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as Icons from "phosphor-react-native"
import React, { useEffect, useState } from 'react'
import { Alert, ScrollView, StyleSheet, View } from 'react-native'

const WalletModal = () => {
    const { user, updateUserData } = useAuth()
    const [wallet, setWallet] = useState<WalletType>({
        name: "",
        image: null
    })
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const oldWallet: { name: string, image: string, id: string } = useLocalSearchParams()

    useEffect(() => {
        if (oldWallet?.id) {
            setWallet({
                name: oldWallet.name || "",
                image: oldWallet.image || null
            })
        }
    }, [])

    const onSubmit = async () => {
        let { name, image } = wallet;
        if (!name.trim() || !image) {
            Alert.alert("Dikkat", "Lütfen boş alanları doldurunuz.");
            return;
        }
        const data: WalletType = {
            name,
            image,
            uid: user?.uid,
        }
        if (oldWallet?.id) data.id = oldWallet.id; // if we are updating, we need to set the id
        setLoading(true)
        const res = await createOrUpdateWallet(data)
        setLoading(false)
        // console.log("Wallet creation response: ", res);
        if (res.success) {

            router.back()
        } else {
            Alert.alert("Dikkat", res.msg)
        }

    }
    const onDelete = async () => {
        if (!oldWallet?.id) return;
        setLoading(true)
        const res = await deleteWallet(oldWallet.id);
        setLoading(false)
        if (res.success) {
            router.back();
    }else{
            Alert.alert("Dikkat", res.msg || "Cüzdan silinirken bir hata oluştu.")
        }
    }
    const showDeleteAlert = () => {
        Alert.alert("Dikkat", "Cüzdanı silmek istediğinize emin misiniz?",
            [
                {
                    text: "Hayır",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel",
                },
                {
                    text: "Evet",
                    onPress: () => onDelete(),
                    style: "destructive",
                }
            ]
        )
    }
    return (
        <ModalWrapper>
            <View style={styles.container}>
                <Header
                    title={oldWallet?.id ? "Cüzdan Güncelle" : "Cüzdan Ekle"} leftIcon={<BackButton />}
                    style={{ marginBottom: spacingY._10 }}
                />
                {/* Form */}
                <ScrollView contentContainerStyle={styles.form}>

                    <View style={styles.inputContainer}>
                        <Typo color={colors.neutral200}>Cüzdan Adı</Typo>
                        <Input placeholder="Cüzdan adı"
                            value={wallet.name}
                            onChangeText={(value) => setWallet({ ...wallet, name: value })}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Typo color={colors.neutral200}>Cüzdan İkonu</Typo>
                        {/* resim inputu */}
                        <ImageUpload
                            file={wallet.image}
                            onSelect={file => setWallet({ ...wallet, image: file })}
                            onClear={() => setWallet({ ...wallet, image: null })}
                            placeholder='Resim yükle' />
                    </View>
                </ScrollView>
                <View style={styles.footer}>
                </View>
            </View>


            <View style={styles.footer}>
                {oldWallet?.id && !loading && (
                    <Button style={{ backgroundColor: colors.rose, paddingHorizontal: spacingX._15 }} onPress={showDeleteAlert} >
                        <Icons.TrashIcon
                            weight='bold'
                            color={colors.white}
                            size={verticalScale(24)} />
                    </Button>
                )}

                <Button onPress={onSubmit} loading={loading} style={{ flex: 1 }} >
                    <Typo color={colors.black} fontWeight={"700"} size={18}>{oldWallet?.id ? "Cüzdanı Güncelle" : "Cüzdan Ekle"}</Typo>
                </Button>
            </View>
        </ModalWrapper>
    )
}

export default WalletModal

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between",
        paddingHorizontal: spacingY._20
    },
    footer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        paddingHorizontal: spacingX._20,
        gap: scale(12),
        paddingTop: spacingY._15,
        borderTopColor: colors.neutral700,
        marginBottom: spacingY._5,
        borderTopWidth: 1
    },
    form: {
        gap: spacingY._30,
        marginTop: spacingY._15
    },
    avatarContainer: {
        position: "relative",
        alignSelf: "center",
    },
    avatar: {
        alignSelf: "center",
        backgroundColor: colors.neutral300,
        height: verticalScale(135),
        width: verticalScale(135),
        borderRadius: 200,
        borderWidth: 1,
        borderColor: colors.neutral500,
        // overflow: "hidden",
        // position: "relative",
    },
    editIcon: {
        position: "absolute",
        bottom: spacingY._5,
        right: spacingY._7,
        borderRadius: 100,
        backgroundColor: colors.neutral100,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 0, },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 4,
        padding: spacingY._10
    },
    inputContainer: {
        gap: spacingY._10
    }
})