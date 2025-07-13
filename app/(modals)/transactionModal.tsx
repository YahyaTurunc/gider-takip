import BackButton from '@/components/BackButton'
import Button from '@/components/Button'
import Header from '@/components/Header'
import ImageUpload from '@/components/ImageUpload'
import Input from '@/components/Input'
import ModalWrapper from '@/components/ModalWrapper'
import Typo from '@/components/Typo'
import { expenseCategories, transactionTypes } from '@/constants/data'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { useAuth } from '@/contexts/authContext'
import useFetchData from '@/hooks/useFetchData'
import { deleteWallet } from '@/services/walletService'
import { TransactionType, WalletType } from '@/types'
import { scale, verticalScale } from '@/utils/styling'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { orderBy, where } from 'firebase/firestore'
import * as Icons from "phosphor-react-native"
import React, { useState } from 'react'
import { Alert, Platform, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Dropdown } from 'react-native-element-dropdown'
const TransactionModal = () => {
  const { user } = useAuth()
  const [transaction, setTransaction] = useState<TransactionType>({
    type: "expense",
    amount: 0,
    description: "",
    category: "",
    date: new Date(),
    walletId: "",
    image: null
  })
  const [loading, setLoading] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const router = useRouter()
  const oldTransaction: { name: string, image: string, id: string } = useLocalSearchParams()
  const { data: wallets, error: walletsError, loading: walletsLoading } = useFetchData<WalletType>("wallets", [
    where("uid", "==", user?.uid),
    orderBy("created", "desc")
  ])

  const onDateChange = (event: any, selectedDate: any) => {
    const currentDate = selectedDate || transaction.date;
    setTransaction({ ...transaction, date: currentDate });
    setShowDatePicker(Platform.OS === 'ios' ? true : false); // Keep date picker open on iOS
  }

  // useEffect(() => {
  //     if (oldTransaction?.id) {
  //         setTransaction({
  //             name: oldTransaction.name || "",
  //             image: oldTransaction.image || null
  //         })
  //     }
  // }, [])

  const onSubmit = async () => {
    const { type, amount, description, category, date, walletId, image } = transaction;
    if (!amount || !walletId || !date || (type === "expense" && !category)) {
      Alert.alert("Dikkat", "Lütfen gerekli alanları doldurunuz.");
      return;
    }

    let transactionData: TransactionType = {
      type,
      amount,
      category,
      date,
      description,
      walletId,
      image,
      uid: user?.uid
    }
    console.log("transactionData: ", transactionData);
  }
  const onDelete = async () => {
    if (!oldTransaction?.id) return;
    setLoading(true)
    const res = await deleteWallet(oldTransaction.id);
    setLoading(false)
    if (res.success) {
      router.back();
    } else {
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
          title={oldTransaction?.id ? "İşlemi Güncelle" : "İşlem Ekle"} leftIcon={<BackButton />}
          style={{ marginBottom: spacingY._10 }}
        />
        {/* Form */}
        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>

          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200} size={16}>Tip</Typo>
            <Dropdown
              style={styles.dropdownContainer}
              activeColor={colors.neutral700}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelectedText}
              iconStyle={styles.dropdownIcon}
              data={transactionTypes}
              maxHeight={300}
              labelField="label"
              valueField="value"
              itemTextStyle={styles.dropdownItemText}
              itemContainerStyle={styles.dropdownItemContainer}
              containerStyle={styles.dropdownListContainer}
              value={transaction.type}
              onChange={item => {
                setTransaction({ ...transaction, type: item.value });
              }}
              renderLeftIcon={() => (
                <Icons.ArrowsDownUpIcon
                  weight='bold'
                  color={colors.neutral300}
                  size={verticalScale(24)}
                  style={{ marginRight: spacingX._10 }}
                />
              )}
            />
          </View>
          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200} size={16}>Cüzdan</Typo>
            <Dropdown
              style={styles.dropdownContainer}
              activeColor={colors.neutral700}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelectedText}
              iconStyle={styles.dropdownIcon}
              data={wallets.map(wallet => ({
                label: `${wallet.name} (${wallet.amount || 0}₺)`,
                value: wallet.id
              }))}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder='Cüzdan seçin'
              itemTextStyle={styles.dropdownItemText}
              itemContainerStyle={styles.dropdownItemContainer}
              containerStyle={styles.dropdownListContainer}
              value={transaction.walletId}
              onChange={item => {
                setTransaction({ ...transaction, walletId: item.value || "" });
              }}
              renderLeftIcon={() => (
                <Icons.WalletIcon
                  weight='bold'
                  color={colors.neutral300}
                  size={verticalScale(24)}
                  style={{ marginRight: spacingX._10 }}
                />
              )}
            />
          </View>
          {transaction.type === "expense" && (
            <View style={styles.inputContainer}>
              <Typo color={colors.neutral200} size={16}>Gider Türü</Typo>
              <Dropdown
                style={styles.dropdownContainer}
                activeColor={colors.neutral700}
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownSelectedText}
                iconStyle={styles.dropdownIcon}
                data={Object.values(expenseCategories)}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder='Gider türü seçin'
                itemTextStyle={styles.dropdownItemText}
                itemContainerStyle={styles.dropdownItemContainer}
                containerStyle={styles.dropdownListContainer}
                value={transaction.category}
                onChange={item => {
                  setTransaction({ ...transaction, category: item.value || "" });
                }}
                renderLeftIcon={() => (
                  <Icons.WalletIcon
                    weight='bold'
                    color={colors.neutral300}
                    size={verticalScale(24)}
                    style={{ marginRight: spacingX._10 }}
                  />
                )}
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200} size={16}>Tarih</Typo>
            {
              !showDatePicker && (
                <Pressable
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker(true)}>

                  <Typo size={14}>
                    {(transaction.date as Date).toLocaleDateString("tr-TR")}
                  </Typo>
                </Pressable>
              )
            }
            {showDatePicker && (
              <View style={Platform.OS == 'ios' && styles.iosDatePicker}>
                <DateTimePicker
                  themeVariant='dark'
                  value={transaction.date as Date}
                  mode='date'
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  locale='tr-TR'
                  onChange={onDateChange}
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => setShowDatePicker(false)}>
                    <Typo size={15} fontWeight={"500"} color={colors.neutral200}>Tamam</Typo>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200} size={16}>Miktar</Typo>
            <Input
              // placeholder="Cüzdan adı"
              keyboardType='numeric'
              value={transaction.amount.toString()}
              onChangeText={(value) => setTransaction({
                ...transaction,
                amount: Number(value.replace(/[^0-9]/g, ''))
              })}
            />
          </View>
          <View style={styles.inputContainer}>
            <View style={styles.flexRow}>
              <Typo color={colors.neutral200} size={16} >Açıklama</Typo>
              <Typo color={colors.neutral500} size={14}>(isteğe bağlı)</Typo>

            </View>
            <Input
              // placeholder="Cüzdan adı"
              value={transaction.description}
              multiline
              containerStyle={{
                flexDirection: "row",
                alignItems: "flex-start",
                height: verticalScale(100),
                paddingVertical: 15,
              }}
              onChangeText={(value) => setTransaction({
                ...transaction,
                description: value
              })}
            />
          </View>
          <View style={styles.inputContainer}>
            <View style={styles.flexRow}>
              <Typo color={colors.neutral200} size={16} >Makbuz</Typo>
              <Typo color={colors.neutral500} size={14}>(isteğe bağlı)</Typo>
            </View>
            {/* resim inputu */}
            <ImageUpload
              file={transaction.image}
              onSelect={file => setTransaction({ ...transaction, image: file })}
              onClear={() => setTransaction({ ...transaction, image: null })}
              placeholder='Resim yükle' />
          </View>
        </ScrollView>
        <View style={styles.footer}>
        </View>
      </View>


      <View style={styles.footer}>
        {oldTransaction?.id && !loading && (
          <Button style={{ backgroundColor: colors.rose, paddingHorizontal: spacingX._15 }} onPress={showDeleteAlert} >
            <Icons.TrashIcon
              weight='bold'
              color={colors.white}
              size={verticalScale(24)} />
          </Button>
        )}

        <Button onPress={onSubmit} loading={loading} style={{ flex: 1 }} >
          <Typo color={colors.black} fontWeight={"700"} size={18}>{oldTransaction?.id ? "Güncelle" : "Ekle"}</Typo>
        </Button>
      </View>
    </ModalWrapper>
  )
}

export default TransactionModal

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingY._20
  },
  datePickerButton: {
    backgroundColor: colors.neutral700,
    alignSelf: 'flex-end',
    padding: spacingY._7,
    marginRight: spacingY._7,
    paddingHorizontal: spacingY._15,
    borderRadius: radius._10,
  },
  form: {
    gap: spacingY._30,
    marginTop: spacingY._15
  },
  dropdownContainer: {
    height: verticalScale(54),
    borderWidth: 1,
    borderColor: colors.neutral300,
    paddingHorizontal: spacingX._15,
    borderRadius: radius._15,
    borderCurve: 'continuous',
  },
  dropdownItemText: { color: colors.white },
  dropdownPlaceholder: { color: colors.white },
  dropdownSelectedText: {
    color: colors.white,
    fontSize: verticalScale(14),
  },
  dropdownItemContainer: {
    borderRadius: radius._15,
    marginHorizontal: spacingX._7,
  },
  dropdownIcon: {
    height: verticalScale(30),
    tintColor: colors.neutral300,
  },
  dropdownListContainer: {
    backgroundColor: colors.neutral900,
    borderRadius: radius._15,
    borderCurve: 'continuous',
    paddingVertical: spacingY._7,
    top: 5,
    borderColor: colors.neutral500,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 5,
  },
  inputContainer: {
    gap: spacingY._10
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
  iosDatePicker: {},

  dateInput: {
    flexDirection: 'row',
    height: verticalScale(54),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral300,
    borderRadius: radius._17,
    borderCurve: 'continuous',
    paddingHorizontal: spacingX._15,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._5
  }
})