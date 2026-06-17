import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  ScrollView, 
  SafeAreaView, 
  Dimensions,
  Alert,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// Импортируем Firebase компоненты
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, off } from 'firebase/database';

const { width } = Dimensions.get('window');

// КОНФИГУРАЦИЯ FIREBASE (Твоя база данных)
const firebaseConfig = {
  databaseURL: "https://familyshoppinglist-3193b-default-rtdb.firebaseio.com/"
};

// Инициализируем Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);

export default function App() {
  const [password, setPassword] = useState(null); // Храним текущий пароль (идентификатор списка)
  const [inputPassword, setInputPassword] = useState(''); // Для экрана ввода
  const [isAuthChecking, setIsAuthChecking] = useState(true); // Загрузка при старте
  const [isLoadingData, setIsLoadingData] = useState(false); // Загрузка данных из БД

  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [workData, setWorkData] = useState({}); 
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [rate, setRate] = useState('');
  const [hours, setHours] = useState('');

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // 1. Таймер часов и проверка сохраненного пароля на телефоне
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    checkSavedPassword();
    return () => clearInterval(timer);
  }, []);

  // 2. Слушатель базы данных в реальном времени (включается только когда есть пароль)
  useEffect(() => {
    if (!password) {
      setWorkData({});
      return;
    }

    setIsLoadingData(true);
    // Ссылка на ветку конкретно этого пароля в твоей Realtime Database
    const listRef = ref(db, `tabulka_lists/${password}`);

    // onValue автоматически срабатывает при ЛЮБЫХ изменениях в БД у кого угодно
    const unsubscribe = onValue(listRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setWorkData(data);
      } else {
        setWorkData({});
      }
      setIsLoadingData(false);
    }, (error) => {
      Alert.alert("Ошибка БД", "Проверьте правила доступа в консоли Firebase");
      setIsLoadingData(false);
    });

    // Отписываемся от прослушивания, если вышли из списка
    return () => off(listRef);
  }, [password]);

  // Проверка, входил ли пользователь ранее
  const checkSavedPassword = async () => {
    try {
      const savedPass = await AsyncStorage.getItem('@tabulka_password');
      if (savedPass) {
        setPassword(savedPass);
      }
    } catch (e) {
      Alert.alert("Ошибка", "Не удалось прочитать локальную память");
    } finally {
      setIsAuthChecking(false);
    }
  };

  // Вход / Регистрация списка по паролю
  const handleLogin = async () => {
    const trimmed = inputPassword.trim();
    
    // Проверка условий: минимум 8 символов и одна заглавная буква
    const hasUpperCase = /[A-ZА-Я]/.test(trimmed);
    if (trimmed.length < 8 || !hasUpperCase) {
      Alert.alert(
        "Неверный пароль", 
        "Пароль должен состоять минимум из 8 символов и содержать хотя бы одну заглавную букву."
      );
      return;
    }

    try {
      await AsyncStorage.setItem('@tabulka_password', trimmed);
      setPassword(trimmed);
      setInputPassword('');
    } catch (e) {
      Alert.alert("Ошибка", "Не удалось сохранить авторизацию");
    }
  };

  // Разлогиниться (Выйти из текущего списка)
  const handleLogout = () => {
    Alert.alert(
      "Выход из списка",
      "Вы уверены, что хотите выйти из этого списка? Для повторного доступа нужно будет ввести этот же пароль.",
      [
        { text: "Отмена", style: "cancel" },
        { 
          text: "Выйти", 
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('@tabulka_password');
              setPassword(null);
            } catch (e) {
              Alert.alert("Ошибка", "Не удалось очистить память устройства");
            }
          }
        }
      ]
    );
  };

  // Сохранение дня прямо в Firebase Realtime Database
  const saveDayToFirebase = async (dateStr, dayData) => {
    try {
      const dayRef = ref(db, `tabulka_lists/${password}/${dateStr}`);
      await set(dayRef, dayData);
    } catch (e) {
      Alert.alert("Ошибка сети", "Не удалось отправить данные в облако");
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => {
      const dayNum = i + 1;
      return `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    });
  };

  const handleDayPress = (dateStr) => {
    setSelectedDate(dateStr);
    if (workData[dateStr]) {
      setRate(workData[dateStr].rate.toString());
      setHours(workData[dateStr].hours.toString());
    } else {
      setRate('');
      setHours('');
    }
    setModalVisible(true);
  };

  const handleSaveDay = () => {
    const numRate = parseFloat(rate);
    const numHours = parseFloat(hours);

    if (!rate || !hours || isNaN(numRate) || isNaN(numHours)) {
      Alert.alert("Ошибка", "Введите корректные числа");
      return;
    }

    // Отправляем в Firebase
    saveDayToFirebase(selectedDate, { rate: numRate, hours: numHours });
    setModalVisible(false);
  };

  const getStatistics = () => {
    const days = getDaysInMonth(currentMonth);
    let workDays = 0;
    let weekendDays = 0;
    let totalSum = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    days.forEach(day => {
      const [year, month, dateNum] = day.split('-').map(Number);
      const checkDate = new Date(year, month - 1, dateNum);
      checkDate.setHours(0, 0, 0, 0);

      if (workData[day]) {
        workDays++;
        totalSum += workData[day].rate * workData[day].hours;
      } else {
        if (checkDate <= today) {
          weekendDays++;
        }
      }
    });

    return { workDays, weekendDays, totalSum };
  };

  const stats = getStatistics();

  const exportToPDF = async () => {
    const days = getDaysInMonth(currentMonth);
    const monthStr = currentMonth.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
    
    let tableRows = '';
    days.forEach(day => {
      const data = workData[day];
      const dayNum = day.split('-')[2];
      if (data) {
        const daySum = data.rate * data.hours;
        tableRows += `<tr><td>${dayNum}</td><td>Рабочий</td><td>${data.rate}</td><td>${data.hours}</td><td>${daySum}</td></tr>`;
      } else {
        tableRows += `<tr><td>${dayNum}</td><td>Выходной</td><td>-</td><td>-</td><td>-</td></tr>`;
      }
    });

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica'; padding: 20px; color: #333; }
            h1 { text-align: center; color: #0052CC; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
            th { background-color: #f3f4f6; }
            .stats { margin-top: 30px; font-size: 18px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Отчет «Табулька» — ${monthStr}</h1>
          <table>
            <tr><th>День</th><th>Статус</th><th>Ставка</th><th>Часы</th><th>Сумма</th></tr>
            ${tableRows}
          </table>
          <div class="stats">
            <p>Отработано дней: ${stats.workDays}</p>
            <p>Выходных дней: ${stats.weekendDays}</p>
            <p>Общий заработок: ${stats.totalSum}</p>
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось создать или отправить PDF");
    }
  };

  if (isAuthChecking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0052CC" />
      </View>
    );
  }

  if (!password) {
    return (
      <SafeAreaView style={styles.authContainer}>
        <View style={styles.authCard}>
          <Text style={styles.authTitle}>Вход в «Табульку»</Text>
          <Text style={styles.authSubtitle}>Введите пароль вашей семьи для синхронизации смен</Text>
          <TextInput
            placeholder="Введите секретный пароль"
            secureTextEntry={true}
            style={styles.authInput}
            value={inputPassword}
            onChangeText={setInputPassword}
          />
          <Text style={styles.authHint}>Пароль должен содержать минимум 8 символов и 1 заглавную букву.</Text>
          <TouchableOpacity style={styles.authButton} onPress={handleLogin}>
            <Text style={styles.authButtonText}>Войти / Создать список</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.dateText}>{currentTime.toLocaleDateString('ru-RU')}</Text>
            <Text style={styles.timeText}>{currentTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Выйти</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.monthTitle}>
          {currentMonth.toLocaleString('ru-RU', { month: 'long', year: 'numeric' }).toUpperCase()}
        </Text>

        <View style={styles.weekDaysRow}>
          {weekDays.map((day, index) => (
            <Text 
              key={index} 
              style={[
                styles.weekDayText, 
                (day === 'Сб' || day === 'Вс') && styles.weekendText
              ]}
            >
              {day}
            </Text>
          ))}
        </View>

        {isLoadingData ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#0052CC" />
            <Text style={{ marginTop: 10, color: '#6B7280' }}>Синхронизация...</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.calendarGrid}>
            {getDaysInMonth(currentMonth).map((dateStr) => {
              const isWorkDay = !!workData[dateStr];
              const dayNum = dateStr.split('-')[2];
              return (
                <TouchableOpacity
                  key={dateStr}
                  style={[styles.dayCell, isWorkDay ? styles.workDayCell : styles.weekendCell]}
                  onPress={() => handleDayPress(dateStr)}
                >
                  <Text style={[styles.dayText, isWorkDay && styles.workDayText]}>{parseInt(dayNum)}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>Отработано дней: <Text style={styles.bold}>{stats.workDays}</Text></Text>
          <Text style={styles.statsText}>Выходных дней: <Text style={styles.bold}>{stats.weekendDays}</Text></Text>
          <Text style={styles.totalText}>Сумма: <Text style={styles.bold}>{stats.totalSum}</Text></Text>
        </View>

        <TouchableOpacity style={styles.pdfButton} onPress={exportToPDF}>
          <Text style={styles.pdfButtonText}>Сохранить PDF и поделиться</Text>
        </TouchableOpacity>

        <Modal visible={modalVisible} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>День: {selectedDate ? selectedDate.split('-')[2] : ''}</Text>
              
              {workData[selectedDate] && (
                <Text style={styles.historyHint}>
                  В этот день отработано часов: {workData[selectedDate].hours}, ставка: {workData[selectedDate].rate}. Итого за день: {workData[selectedDate].rate * workData[selectedDate].hours}
                </Text>
              )}

              <TextInput
                placeholder="Стоимость часа работы"
                style={styles.input}
                keyboardType="numeric"
                value={rate}
                onChangeText={setRate}
              />
              <TextInput
                placeholder="Количество часов"
                style={styles.input}
                keyboardType="numeric"
                value={hours}
                onChangeText={setHours}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleSaveDay}>
                  <Text style={styles.btnText}>Добавить</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setModalVisible(false)}>
                  <Text style={styles.btnText}>Отмена</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  authContainer: { flex: 1, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  authCard: { width: width * 0.88, backgroundColor: '#FFF', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', elevation: 3 },
  authTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 8, textAlign: 'center' },
  authSubtitle: { fontSize: 14, color: '#4B5563', marginBottom: 20, textAlign: 'center', lineHeight: 20 },
  authInput: { borderBottomWidth: 1, borderColor: '#D1D5DB', paddingVertical: 10, fontSize: 16, marginBottom: 10, textAlign: 'center' },
  authHint: { fontSize: 12, color: '#9CA3AF', marginBottom: 20, textAlign: 'center' },
  authButton: { backgroundColor: '#0052CC', padding: 14, borderRadius: 10, alignItems: 'center' },
  authButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  safeArea: { flex: 1, backgroundColor: '#F9FAFB', paddingTop: 40, paddingBottom: 20 },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  dateText: { fontSize: 15, color: '#6B7280' },
  timeText: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  
  logoutButton: { paddingVertical: 8, paddingHorizontal: 14, backgroundColor: '#EF4444', borderRadius: 8 },
  logoutText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  
  monthTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 15, textAlign: 'center' },
  
  weekDaysRow: { flexDirection: 'row', strokeLinecap: 'round', justifyContent: 'flex-start', paddingHorizontal: 4, marginBottom: 8 },
  weekDayText: { width: (width - 32) / 7 - 8, marginHorizontal: 4, textAlign: 'center', fontSize: 14, fontWeight: '700', color: '#9CA3AF' },
  weekendText: { color: '#EF4444' },

  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  dayCell: { width: (width - 32) / 7 - 8, height: 45, margin: 4, justifyContent: 'center', alignItems: 'center', borderRadius: 8, borderWidth: 1 },
  weekendCell: { backgroundColor: '#FFF', borderColor: '#E5E7EB' },
  workDayCell: { backgroundColor: '#0052CC', borderColor: '#0052CC' },
  dayText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  workDayText: { color: '#FFF' },
  statsContainer: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginTop: 15, borderWidth: 1, borderColor: '#E5E7EB' },
  statsText: { fontSize: 14, color: '#4B5563', marginBottom: 4 },
  totalText: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginTop: 8 },
  bold: { fontWeight: 'bold', color: '#111827' },
  pdfButton: { backgroundColor: '#10B981', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 15, marginBottom: 10 },
  pdfButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.85, backgroundColor: '#FFF', padding: 20, borderRadius: 16, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  historyHint: { fontSize: 13, color: '#0052CC', marginBottom: 15, fontWeight: '500', lineHeight: 18 },
  input: { borderBottomWidth: 1, borderColor: '#D1D5DB', paddingVertical: 8, marginBottom: 15, fontSize: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  btn: { flex: 0.48, padding: 12, borderRadius: 8, alignItems: 'center' },
  btnSave: { backgroundColor: '#0052CC' },
  btnCancel: { backgroundColor: '#9CA3AF' },
  btnText: { color: '#FFF', fontWeight: 'bold' }
});
