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
const Register = () => {
    const emailRef = useRef("");
    const passwordRef = useRef("");
    const namedRef = useRef("");
    const [isLoading, setisLoading] = useState(false)
    const router = useRouter()
    const { register: registerUser } = useAuth();
    const handleSubmit = async () => {
        if (!emailRef.current || !passwordRef.current || !namedRef.current) {
            Alert.alert("Kayıt ol", "Lütfen boş alanları doldurunuz.")
            return;
        }
        setisLoading(true)
        const res = await registerUser(
            emailRef.current,
            passwordRef.current,
            namedRef.current
        )
        setisLoading(false)
        console.log('result111: ', res);
        if (!res.success) {
            Alert.alert("Kayıt ol", res.msg)
        }
    }

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <BackButton iconSize={28} />

                <View style={{ gap: 5, marginTop: spacingY._20 }}>
                    <Typo size={25} fontWeight={"800"}>Hoşgeldiniz</Typo>
                    <Typo size={30} fontWeight={"800"}>Hadi başlayalım</Typo>
                </View>

                {/* form */}

                <View style={styles.form}>
                    <Typo size={16} color={colors.textLighter}>Kayıt ol ve giderlerini takip etmeye başla</Typo>

                    <Input
                        placeholder='İsim Soyisim'
                        icon={<Icons.UserIcon color={colors.neutral300} size={verticalScale(26)} />}
                        onChangeText={(value) => (namedRef.current = value)}
                    />
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

                    <Button loading={isLoading} onPress={handleSubmit}>
                        <Typo fontWeight={"700"} color={colors.black} size={21}>Kayıt Ol</Typo>
                    </Button>
                </View>

                <View style={styles.footer}>
                    <Typo size={15}>Zaten hesabınız var mı?</Typo>
                    <Pressable onPress={() => router.navigate("/(auth)/login")}>
                        <Typo size={15} fontWeight={"700"} color={colors.primary}>Giriş Yap</Typo>
                    </Pressable>
                </View>
            </View>
        </ScreenWrapper>
    )
}

export default Register

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