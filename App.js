import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Agenda } from 'react-native-calendars';
import * as Application from 'expo-application';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const FIREBASE_REST_URL = "https://tabulka-c93d5-default-rtdb.europe-west1.firebasedatabase.app";
const SECURE_STORE_KEY = "user_activation_key_tabulka";
const DEVICE_UUID_KEY = "user_device_uuid_tabulka"; // Ключ для вечного ID устройства

const translations = {
  ru: {
    authTitle: "Активация приложения",
    authSubtitle: "Введите ваш лицензионный ключ для доступа к базе данных",
    inputPlaceholder: "Ключ активации (например, VIP_123)",
    btnActivate: "Активировать",
    errEmptyKey: "Пожалуйста, введите ключ активации.",
    errInvalidKey: "Ключ не найден или недействителен.",
    errDeviceLocked: "Этот ключ уже закреплен за другим устройством!",
    toastWelcome: "Активация успешна! Добро пожаловать.",
    agendaTitle: "Учёт рабочих дней",
    dayTotalText: "Всего за день:",
    btnAddRecord: "+ Добавить запись",
    placeholderRate: "Ставка",
    placeholderHours: "Часы",
    btnSaveDay: "Сохранить день",
    btnCancel: "Отмена",
    alertConfirmDelete: "Удалить запись?",
    alertDeleteMsg: "Вы уверены, что хотите удалить эту рабочую строку?",
    btnDelete: "Удалить",
    msgNoRecords: "Нет записей за этот день",
    msgLoading: "Загрузка данных...",
    msgSaving: "Сохранение...",
    errorFetch: "Ошибка сети. Данные загружены из кэша.",
    errorSave: "Не удалось сохранить данные на сервере."
  },
  uk: {
    authTitle: "Активація додатка",
    authSubtitle: "Введіть ваш ліцензійний ключ для доступу до бази даних",
    inputPlaceholder: "Ключ активації (наприклад, FAMILY_123)",
    btnActivate: "Активувати",
    errEmptyKey: "Будь ласка, введіть ключ активації.",
    errInvalidKey: "Ключ не знайдено або він недійсний.",
    errDeviceLocked: "Цей ключ вже закріплений за іншим пристроєм!",
    toastWelcome: "Активація успешна! Ласкаво просимо.",
    agendaTitle: "Облік робочих днів",
    dayTotalText: "Всього за день:",
    btnAddRecord: "+ Додати запис",
    placeholderRate: "Ставка",
    placeholderHours: "Години",
    btnSaveDay: "Зберегти день",
    btnCancel: "Скасувати",
    alertConfirmDelete: "Видалити запись?",
    alertDeleteMsg: "Ви впевнені, что хочете видалити цей робочий рядок?",
    btnDelete: "Вилучити",
    msgNoRecords: "Немає записів за цей день",
    msgLoading: "Завантаження даних...",
    msgSaving: "Збереження...",
    errorFetch: "Помилка мережі. Дані завантажено з кешу.",
    errorSave: "Не вдалося зберегти дані на сервері."
  }
};

const systemLang = 'uk'; 
const t = translations[systemLang] || translations.ru;

export default function App() {
  const [password, setPassword] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isActivating, setIsActivating] = useState(false);

  const [workData, setWorkData] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [rate, setRate] = useState('');
  const [hours, setHours] = useState('');
  const [tempRecords, setTempRecords] = useState([]);

  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().split('T')[0].substring(0, 7));

  // НАДЕЖНЫЙ СПОСОБ ОПРЕДЕЛЕНИЯ УНИКАЛЬНОГО ID УСТРОЙСТВА
  const getUniqueDeviceId = async () => {
    try {
      // 1. Пробуем взять родной Android ID
      if (Application.androidId) {
        return Application.androidId;
      }
      // 2. Если его нет (баг сборки), проверяем наш сгенерированный UUID в памяти
      let savedUUID = await SecureStore.getItemAsync(DEVICE_UUID_KEY);
      if (!savedUUID) {
        // Если это первый запуск и Android ID пуст — создаем свой уникальный маркер
        savedUUID = "dev_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        await SecureStore.setItemAsync(DEVICE_UUID_KEY, savedUUID);
      }
      return savedUUID;
    } catch (e) {
      return "DEVICE_GENERIC_FALLBACK_ID";
    }
  };

  useEffect(() => {
    async function checkSavedPassword() {
      try {
        const savedPass = await SecureStore.getItemAsync(SECURE_STORE_KEY);
        if (savedPass) {
          const trimmed = savedPass.trim();
          const response = await fetch(`${FIREBASE_REST_URL}/activation_keys/${trimmed}.json`);
          const keyData = await response.json();

          if (keyData && keyData.status === "used") {
            const deviceId = await getUniqueDeviceId();
            
            // СЕМЕЙНЫЙ ДОСТУП (Пропускает без привязки к одному ID)
            if (keyData.isFamily || trimmed.startsWith("FAMILY_")) {
              setPassword(trimmed);
              await fetchWorkData(trimmed);
            } 
            // ОБЫЧНЫЙ ДОСТУП (Проверяет конкретное устройство)
            else if (keyData.deviceId === deviceId) {
              setPassword(trimmed);
              await fetchWorkData(trimmed);
            } else {
              await SecureStore.deleteItemAsync(SECURE_STORE_KEY);
            }
          } else {
            await SecureStore.deleteItemAsync(SECURE_STORE_KEY);
          }
        }
      } catch (error) {
        console.log("Error checking saved key:", error);
      } finally {
        setIsAuthChecking(false);
      }
    }
    checkSavedPassword();
  }, [currentMonth]);

  const fetchWorkData = async (userKey) => {
    if (!userKey) return;
    setIsLoadingData(true);
    try {
      const response = await fetch(`${FIREBASE_REST_URL}/tabulka_lists/${userKey}.json`);
      const data = await response.json();
      if (data) {
        setWorkData(data);
      } else {
        setWorkData({});
      }
    } catch (error) {
      Alert.alert(t.agendaTitle, t.errorFetch);
    } finally {
      setIsLoadingData(false);
    }
  };

  const refreshSingleDayData = async (dateStr, userKey) => {
    if (!userKey || !dateStr) return;
    try {
      const yearMonth = dateStr.substring(0, 7);
      const dayStr = dateStr.substring(8, 10);
      const response = await fetch(`${FIREBASE_REST_URL}/tabulka_lists/${userKey}/${yearMonth}/${dayStr}.json`);
      const dayData = await response.json();
      
      setWorkData(prev => {
        const updated = { ...prev };
        if (!updated[yearMonth]) updated[yearMonth] = {};
        if (dayData) {
          updated[yearMonth][dayStr] = dayData;
        } else {
          delete updated[yearMonth][dayStr];
        }
        return updated;
      });

      if (dayData && dayData.records) {
        setTempRecords(dayData.records);
      } else {
        setTempRecords([]);
      }
    } catch (e) {
      console.log("Error refreshing day data:", e);
    }
  };

  const handleActivation = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      Alert.alert(t.authTitle, t.errEmptyKey);
      return;
    }

    setIsActivating(true);
    try {
      const response = await fetch(`${FIREBASE_REST_URL}/activation_keys/${trimmed}.json`);
      const keyData = await response.json();

      if (!keyData) {
        Alert.alert(t.authTitle, t.errInvalidKey);
        setIsActivating(false);
        return;
      }

      const deviceId = await getUniqueDeviceId();

      // Активация семейного ключа (пишем флаг isFamily)
      if (trimmed.startsWith("FAMILY_")) {
        await fetch(`${FIREBASE_REST_URL}/activation_keys/${trimmed}.json`, {
          method: 'PATCH',
          body: JSON.stringify({ status: "used", isFamily: true })
        });
        await SecureStore.setItemAsync(SECURE_STORE_KEY, trimmed);
        setPassword(trimmed);
        Alert.alert(t.authTitle, t.toastWelcome);
        await fetchWorkData(trimmed);
      } 
      // Активация обычного ключа (привязываем девайс)
      else {
        if (keyData.status === "free") {
          await fetch(`${FIREBASE_REST_URL}/activation_keys/${trimmed}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ status: "used", deviceId: deviceId })
          });
          await SecureStore.setItemAsync(SECURE_STORE_KEY, trimmed);
          setPassword(trimmed);
          Alert.alert(t.authTitle, t.toastWelcome);
          await fetchWorkData(trimmed);
        } else if (keyData.status === "used" && keyData.deviceId === deviceId) {
          await SecureStore.setItemAsync(SECURE_STORE_KEY, trimmed);
          setPassword(trimmed);
          await fetchWorkData(trimmed);
        } else {
          Alert.alert(t.authTitle, t.errDeviceLocked);
        }
      }
    } catch (error) {
      Alert.alert(t.authTitle, t.errInvalidKey);
    } finally {
      setIsActivating(false);
    }
  };

  const handleDayPress = async (day) => {
    const dateStr = day.dateString;
    setSelectedDate(dateStr);
    
    const yearMonth = dateStr.substring(0, 7);
    const dayStr = dateStr.substring(8, 10);
    
    const existingDayData = workData[yearMonth]?.[dayStr];
    if (existingDayData && existingDayData.records) {
      setTempRecords(existingDayData.records);
    } else {
      setTempRecords([]);
    }
    
    setRate('');
    setHours('');
    setModalVisible(true);

    await refreshSingleDayData(dateStr, password);
  };

  const handleAddRecord = () => {
    const parsedRate = parseFloat(rate);
    const parsedHours = parseFloat(hours);

    if (isNaN(parsedRate) || isNaN(parsedHours) || parsedRate <= 0 || parsedHours <= 0) {
      return;
    }

    const newRecord = {
      id: Math.random().toString(36).substring(2, 9) + Date.now().toString(),
      rate: parsedRate,
      hours: parsedHours,
      total: Math.round(parsedRate * parsedHours * 100) / 100
    };

    setTempRecords([...tempRecords, newRecord]);
    setRate('');
    setHours('');
  };

  const handleDeleteRecord = (id) => {
    Alert.alert(t.alertConfirmDelete, t.alertDeleteMsg, [
      { text: t.btnCancel, style: 'cancel' },
      {
        text: t.btnDelete,
        style: 'destructive',
        onPress: () => {
          setTempRecords(tempRecords.filter(rec => rec.id !== id));
        }
      }
    ]);
  };

  const getDayTotal = (dayData) => {
    if (!dayData || !dayData.records) return 0;
    return dayData.records.reduce((sum, rec) => sum + rec.total, 0);
  };

  const getTempTotal = () => {
    return tempRecords.reduce((sum, rec) => sum + rec.total, 0);
  };

  const handleSaveDay = async () => {
    if (!selectedDate || !password) return;

    const yearMonth = selectedDate.substring(0, 7);
    const dayStr = selectedDate.substring(8, 10);

    const updatedDayData = tempRecords.length > 0 ? {
      records: tempRecords,
      date: selectedDate
    } : null;

    try {
      if (updatedDayData) {
        await fetch(`${FIREBASE_REST_URL}/tabulka_lists/${password}/${yearMonth}/${dayStr}.json`, {
          method: 'PUT',
          body: JSON.stringify(updatedDayData)
        });
      } else {
        await fetch(`${FIREBASE_REST_URL}/tabulka_lists/${password}/${yearMonth}/${dayStr}.json`, {
          method: 'DELETE'
        });
      }

      setWorkData(prev => {
        const copy = { ...prev };
        if (!copy[yearMonth]) copy[yearMonth] = {};
        if (updatedDayData) {
          copy[yearMonth][dayStr] = updatedDayData;
        } else {
          delete copy[yearMonth][dayStr];
        }
        return copy;
      });

      setModalVisible(false);
    } catch (error) {
      Alert.alert(t.agendaTitle, t.errorSave);
    }
  };

  const formatAgendaItems = () => {
    const items = {};
    const year = currentMonth.substring(0, 4);
    const month = currentMonth.substring(5, 7);
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let d = 1; d <= daysInMonth; d++) {
      const dayString = `${year}-${month}-${d < 10 ? '0' + d : d}`;
      const yearMonth = dayString.substring(0, 7);
      const dayStr = dayString.substring(8, 10);
      
      const dayData = workData[yearMonth]?.[dayStr];
      items[dayString] = dayData ? [dayData] : [];
    }
    return items;
  };

  if (!password) {
    return (
      <View style={styles.authContainer}>
        <View style={styles.authCard}>
          <Ionicons name="lock-closed" size={48} color="#2563EB" style={{ alignSelf: 'center', marginBottom: 16 }} />
          <Text style={styles.authTitle}>{t.authTitle}</Text>
          <Text style={styles.authSubtitle}>{t.authSubtitle}</Text>
          
          <TextInput
            style={styles.authInput}
            placeholder={t.inputPlaceholder}
            placeholderTextColor="#9CA3AF"
            value={inputValue}
            onChangeText={setInputValue}
            autoCapitalize="characters"
          />

          <TouchableOpacity style={styles.authButton} onPress={handleActivation} disabled={isActivating}>
            {isActivating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.authButtonText}>{t.btnActivate}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.agendaTitle}</Text>
        {isLoadingData && <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 8 }} />}
      </View>

      <Agenda
        items={formatAgendaItems()}
        selected={new Date().toISOString().split('T')[0]}
        onDayPress={handleDayPress}
        onMonthChange={(month) => setCurrentMonth(month.dateString.substring(0, 7))}
        rowHasChanged={(r1, r2) => JSON.stringify(r1) !== JSON.stringify(r2)}
        pastScrollRange={3}
        futureScrollRange={3}
        theme={{
          selectedDayBackgroundColor: '#2563EB',
          todayTextColor: '#2563EB',
          agendaDayTextColor: '#6B7280',
          agendaDayNumColor: '#6B7280',
          agendaTodayColor: '#2563EB',
          dotColor: '#2563EB',
        }}
        renderRow={(item) => {
          return (
            <TouchableOpacity style={styles.agendaItem} onPress={() => handleDayPress({ dateString: item.date })}>
              <View style={styles.agendaRowTop}>
                <Text style={styles.agendaItemTitle}>{t.dayTotalText}</Text>
                <Text style={styles.agendaItemTotal}>{getDayTotal(item)}</Text>
              </View>
              <Text style={styles.agendaItemSub}>{item.records.length} строк(и)</Text>
            </TouchableOpacity>
          );
        }}
        renderEmptyDate={() => (
          <View style={styles.emptyDateContainer}>
            <Text style={styles.emptyDateText}>—</Text>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedDate}</Text>

            {/* СПИСОК: Увеличена высота (maxHeight: 250), чтобы легко вмещалось 6 записей */}
            <ScrollView style={styles.miniRecordsList} nestedScrollEnabled={true}>
              {tempRecords.length === 0 ? (
                <Text style={styles.noRecordsText}>{t.msgNoRecords}</Text>
              ) : (
                tempRecords.map((item) => (
                  <View key={item.id} style={styles.miniRecordRow}>
                    <Text style={styles.miniRecordText}>
                      {item.rate} × {item.hours} ч = <Text style={{ fontWeight: 'bold' }}>{item.total}</Text>
                    </Text>
                    <TouchableOpacity onPress={() => handleDeleteRecord(item.id)} style={styles.btnDeleteTrash}>
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>

            <View style={styles.dayTotalContainer}>
              <Text style={styles.dayTotalText}>{t.dayTotalText} {getTempTotal()}</Text>
            </View>

            {/* ПЕРЕСТАНОВКА: Теперь инпуты идут СВЕРХУ кнопки добавления */}
            <View style={styles.inputGroupRow}>
              <TextInput
                placeholder={t.placeholderRate}
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                style={[styles.inputInline, { marginRight: 8 }]}
                value={rate}
                onChangeText={setRate}
              />
              <TextInput
                placeholder={t.placeholderHours}
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                style={styles.inputInline}
                value={hours}
                onChangeText={setHours}
              />
            </View>

            {/* Кнопка добавления записи стала ниже полей ввода */}
            <TouchableOpacity style={styles.btnAddRecordRow} onPress={handleAddRecord}>
              <Text style={styles.btnAddRecordRowText}>{t.btnAddRecord}</Text>
            </TouchableOpacity>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={[styles.btnModal, styles.btnModalCancel]} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnModalCancelText}>{t.btnCancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnModal, styles.btnModalSave]} onPress={handleSaveDay}>
                <Text style={styles.btnModalSaveText}>{t.btnSaveDay}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  authContainer: { flex: 1, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', padding: 20 },
  authCard: { backgroundColor: '#fff', width: '100%', maxWidth: 400, borderRadius: 16, padding: 24, elevation: 4 },
  authTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: 8 },
  authSubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  authInput: { backgroundColor: '#F3F4F6', borderRadius: 8, padding: 14, fontSize: 16, color: '#111827', marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB', textAlign: 'center', fontWeight: 'bold' },
  authButton: { backgroundColor: '#2563EB', borderRadius: 8, padding: 14, alignItems: 'center', justifyContent: 'center' },
  authButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  agendaItem: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginRight: 16, marginTop: 16, elevation: 1 },
  agendaRowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  agendaItemTitle: { fontSize: 15, color: '#374151' },
  agendaItemTotal: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  agendaItemSub: { fontSize: 13, color: '#9CA3AF' },
  emptyDateContainer: { justifyContent: 'center', alignItems: 'center', padding: 16, marginTop: 16 },
  emptyDateText: { color: '#9CA3AF', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', width: width * 0.9, maxWidth: 450, borderRadius: 16, padding: 20, elevation: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 14, textAlign: 'center' },
  
  // Увеличили максимальную высоту контейнера списка до 250, чтобы влезало 6 строк
  miniRecordsList: { maxHeight: 250, backgroundColor: '#F3F4F6', borderRadius: 8, padding: 8, marginBottom: 8 },
  
  noRecordsText: { color: '#9CA3AF', textAlign: 'center', marginVertical: 12, fontSize: 14 },
  miniRecordRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, marginBottom: 6, borderWidth: 1, borderColor: '#E5E7EB' },
  miniRecordText: { fontSize: 15, color: '#374151' },
  btnDeleteTrash: { padding: 4 },
  dayTotalContainer: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', marginBottom: 14, alignItems: 'flex-end' },
  dayTotalText: { fontSize: 16, fontWeight: 'bold', color: '#2563EB' },
  inputGroupRow: { flexDirection: 'row', marginBottom: 12 },
  inputInline: { flex: 1, height: 55, backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 12, fontSize: 18, fontWeight: 'bold', color: '#111827', borderWidth: 1, borderColor: '#E5E7EB', textAlign: 'center' },
  btnAddRecordRow: { backgroundColor: '#2563EB', borderRadius: 8, height: 48, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  btnAddRecordRowText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  modalActionsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  btnModal: { flex: 1, height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  btnModalCancel: { backgroundColor: '#F3F4F6', marginRight: 8, borderWidth: 1, borderColor: '#D1D5DB' },
  btnModalCancelText: { color: '#4B5563', fontSize: 15, fontWeight: 'bold', textAlign: 'center' },
  btnModalSave: { backgroundColor: '#10B981' },
  btnModalSaveText: { color: '#fff', fontSize: 15, fontWeight: 'bold', textAlign: 'center' }
});
