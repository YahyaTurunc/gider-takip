import Button from '@/components/Button'
import HomeCard from '@/components/HomeCard'
import ScreenWrapper from '@/components/ScreenWrapper'
import TransactionList from '@/components/TransactionList'
import Typo from '@/components/Typo'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { useAuth } from '@/contexts/authContext'
import useFetchData from '@/hooks/useFetchData'
import { TransactionType } from '@/types'
import { verticalScale } from '@/utils/styling'
import { useRouter } from 'expo-router'
import { limit, orderBy, where } from 'firebase/firestore'
import * as Icons from "phosphor-react-native"
import React from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'

const Home = () => {
    const { user } = useAuth();
    const router = useRouter();
    const constraints = [
        where("uid", "==", user?.uid),
        orderBy("date", "desc"),
        limit(30)
    ]
    const {
        data: recentTransactions,
        error,
        loading: transactionsLoading
    } = useFetchData<TransactionType>("transactions", constraints)

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                {/*//?header */}
                <View style={styles.header}>
                    <View style={{ gap: 4 }}>
                        <Typo size={16} color={colors.neutral400}>
                            Merhaba,
                        </Typo>
                        <Typo size={20} fontWeight={"500"}>
                            {user?.name}
                        </Typo>
                    </View>
                    <TouchableOpacity onPress={() => router.push('/(modals)/searchModal')} style={styles.searchIcon}>
                        <Icons.MagnifyingGlassIcon
                            weight='bold'
                            color={colors.neutral200}
                            size={verticalScale(22)}
                        />
                    </TouchableOpacity>
                </View>
                <ScrollView contentContainerStyle={styles.scrollViewStyle} showsVerticalScrollIndicator={false}>
                    {/* //?kart yapısı */}
                    <View>
                        <HomeCard />
                    </View>
                    <TransactionList
                        title={"Son İşlemler"}
                        data={recentTransactions} // Replace with actual data
                        loading={transactionsLoading}
                        emptyListMessage={"Henüz bir işlem bulunmuyor."}
                    />
                </ScrollView>
                <Button style={styles.floatingButton} onPress={() => router.push('/(modals)/transactionModal')}>
                    <Icons.PlusIcon
                        color={colors.black}
                        weight='bold'
                        size={verticalScale(24)} />
                </Button>
            </View>
        </ScreenWrapper>
    )
}
export default Home

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: spacingX._20,
        marginTop: verticalScale(8),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacingY._10,
    },
    searchIcon: {
        backgroundColor: colors.neutral700,
        padding: spacingX._10,
        borderRadius: 50,
    },
    floatingButton: {
        height: verticalScale(50),
        width: verticalScale(50),
        borderRadius: 100,
        position: 'absolute',
        bottom: verticalScale(30),
        right: verticalScale(30),
    },
    scrollViewStyle: {
        marginTop: spacingY._10,
        paddingBottom: verticalScale(100),
        gap: spacingY._25,
    }
})