import BackButton from '@/components/BackButton'
import Button from '@/components/Button'
import Input from '@/components/Input'
import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { useAuth } from '@/contexts/authContext'
import { verticalScale } from '@/utils/styling'
import { useRouter } from 'expo-router'
import * as Icons from "phosphor-react-native"
import React, { useRef, useState } from 'react'
import { Alert, Pressable, StyleSheet, View } from 'react-native'
const Login = () => {
    const emailRef = useRef("");
    const passwordRef = useRef("");
    const [isLoading, setisLoading] = useState(false)
    const router = useRouter()
    const { login: loginUser } = useAuth();
    const handleSubmit = async () => {
        if (!emailRef.current || !passwordRef.current) {
            Alert.alert("Giriş yap", "Lütfen boş alanları doldurunuz.")
            return;
        }
        setisLoading(true)
        const res = await loginUser(
            emailRef.current,
            passwordRef.current,
        )
        setisLoading(false)
        console.log('result111: ', res);
        if (!res.success) {
            Alert.alert("Giriş yap", res.msg)
        }
    }

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <BackButton iconSize={28} />

                <View style={{ gap: 5, marginTop: spacingY._20 }}>
                    <Typo size={30} fontWeight={"800"}>Tekrar Hoşgeldiniz</Typo>
                </View>

                {/* form */}

                <View style={styles.form}>
                    <Typo size={16} color={colors.textLighter}>Giriş yap ve giderlerini takip et</Typo>

                    <Input
                        placeholder='E-posta'
                        icon={<Icons.AtIcon color={colors.neutral300} size={verticalScale(26)} />}
                        onChangeText={(value) => (emailRef.current = value)}
                    />
                    <Input
                        placeholder='Şifre'
                        icon={<Icons.LockIcon color={colors.neutral300} size={verticalScale(26)} />}
                        onChangeText={(value) => (passwordRef.current = value)}
                        secureTextEntry
                    />
                    <Typo size={14} color={colors.text} style={{ alignSelf: "flex-end" }}>Şifremi unuttum</Typo>

                    <Button loading={isLoading} onPress={handleSubmit}>
                        <Typo fontWeight={"700"} color={colors.black} size={21}>Giriş Yap</Typo>
                    </Button>
                </View>

                <View style={styles.footer}>
                    <Typo size={15}>Hesabınız yok mu?</Typo>
                    <Pressable onPress={() => router.navigate("/(auth)/register")}>
                        <Typo size={15} fontWeight={"700"} color={colors.primary}>Kayıt Ol</Typo>
                    </Pressable>
                </View>
            </View>
        </ScreenWrapper>
    )
}

export default Login

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: spacingY._30,
        paddingHorizontal: spacingX._20
    },
    welcomeText: {
        fontSize: verticalScale(20),
        fontWeight: "bold",
        color: colors.text,
    },
    form: {
        gap: spacingY._20
    },
    forgotPassword: {
        textAlign: "right",
        fontWeight: "bold",
        color: colors.text,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 5
    },
    footerText: {
        textAlign: "center",
        color: colors.text,
        fontSize: verticalScale(15)
    }
})