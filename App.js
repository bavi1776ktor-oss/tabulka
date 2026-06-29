import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
  Alert
} from 'react-native';

// Константы для REST API Firebase
const FIREBASE_REST_URL = 'https://YOUR_PROJECT_ID.firebaseio.com/calendar'; 
const USER_EMAIL_CLEAN = 'user_email_com'; // Очищенный email пользователя

export default function App() {
  // Состояния для календаря
  const [currentDate, setCurrentDate] = useState(new Date());
  const [daysData, setDaysData] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  
  // Состояния для модального окна добавления записей
  const [modalVisible, setModalVisible] = useState(false);
  const [inputRate, setInputRate] = useState('');
  const [inputHours, setInputHours] = useState('');
  
  // Состояние для архива
  const [archiveVisible, setArchiveVisible] = useState(false);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Названия месяцев для вывода
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  // Загрузка данных из Firebase при смене месяца
  useEffect(() => {
    fetchData();
  }, [currentYear, currentMonth]);

  const fetchData = async () => {
    try {
      const response = await fetch(`${FIREBASE_REST_URL}/${USER_EMAIL_CLEAN}/${currentYear}/${currentMonth}.json`);
      const data = await response.json();
      
      if (data) {
        // Защита и нормализация данных: переводим старый формат в массив записей, если нужно
        const normalizedData = {};
        Object.keys(data).forEach(day => {
          const dayContent = data[day];
          if (dayContent && typeof dayContent === 'object' && dayContent.records) {
            normalizedData[day] = dayContent;
          } else if (dayContent && (dayContent.rate || dayContent.hours)) {
            // Конвертируем старую единичную запись в новый массив
            normalizedData[day] = {
              records: [{
                id: 'legacy_' + Date.now() + '_' + Math.random(),
                rate: parseFloat(dayContent.rate) || 0,
                hours: parseFloat(dayContent.hours) || 0
              }]
            };
          } else {
            normalizedData[day] = { records: [] };
          }
        });
        setDaysData(normalizedData);
      } else {
        setDaysData({});
      }
    } catch (error) {
      console.log('Ошибка загрузки данных:', error);
    }
  };

  // Хелпер для подсчета суммы за день
  const getDayTotal = (dayRecords) => {
    if (!dayRecords || !dayRecords.records) return 0;
    return dayRecords.records.reduce((sum, rec) => sum + (rec.rate * rec.hours), 0);
  };

  // Хелпер для подсчета часов за день
  const getDayHours = (dayRecords) => {
    if (!dayRecords || !dayRecords.records) return 0;
    return dayRecords.records.reduce((sum, rec) => sum + rec.hours, 0);
  };

  // Расчет Итого за месяц
  const getMonthTotal = () => {
    let total = 0;
    Object.keys(daysData).forEach(day => {
      total += getDayTotal(daysData[day]);
    });
    return total;
  };

  // Открытие дня
  const openDayDetails = (day) => {
    setSelectedDay(day);
    setInputRate('');
    setInputHours('');
    setModalVisible(true);
  };

  // Добавление новой строчки работы в выбранный день
  const handleAddRecord = () => {
    const rate = parseFloat(inputRate);
    const hours = parseFloat(inputHours);

    if (!rate || !hours || rate <= 0 || hours <= 0) {
      Alert.alert('Ошибка', 'Введите корректную ставку и количество часов');
      return;
    }

    const currentDayData = daysData[selectedDay] || { records: [] };
    const newRecord = {
      id: Date.now().toString() + '_' + Math.random(),
      rate: rate,
      hours: hours
    };

    const updatedRecords = [...(currentDayData.records || []), newRecord];
    const updatedDayData = { ...currentDayData, records: updatedRecords };

    // Локальное обновление состояния экрана
    setDaysData({
      ...daysData,
      [selectedDay]: updatedDayData
    });

    // Очищаем поля ввода для следующей записи
    setInputRate('');
    setInputHours('');
  };

  // Удаление отдельной записи из дня
  const handleDeleteRecord = (recordId) => {
    const currentDayData = daysData[selectedDay];
    if (!currentDayData || !currentDayData.records) return;

    const updatedRecords = currentDayData.records.filter(rec => rec.id !== recordId);
    const updatedDayData = { ...currentDayData, records: updatedRecords };

    setDaysData({
      ...daysData,
      [selectedDay]: updatedDayData
    });
  };

  // Сохранение всех записей дня в Firebase при закрытии модалки
  const saveDayAndClose = async () => {
    if (!selectedDay) return;

    const dayDataToSave = daysData[selectedDay] || { records: [] };

    try {
      // Если записей в дне не осталось, удаляем узел из базы, чтобы не висел пустой объект
      if (dayDataToSave.records.length === 0) {
        await fetch(`${FIREBASE_REST_URL}/${USER_EMAIL_CLEAN}/${currentYear}/${currentMonth}/${selectedDay}.json`, {
          method: 'DELETE'
        });
      } else {
        await fetch(`${FIREBASE_REST_URL}/${USER_EMAIL_CLEAN}/${currentYear}/${currentMonth}/${selectedDay}.json`, {
          method: 'PUT',
          body: JSON.stringify(dayDataToSave)
        });
      }
      setModalVisible(false);
      setSelectedDay(null);
      fetchData(); // Перезапрашиваем актуальные данные
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сохранить данные на сервере');
      console.log('Ошибка сохранения:', error);
    }
  };

  // Генерация списка месяцев для архива (Ровно 12 месяцев назад без дубликатов)
  const getArchiveMonths = () => {
    const list = [];
    const today = new Date();
    
    for (let i = 0; i < 12; i++) {
      // Создаем чистый объект даты на базе текущего года и месяца, сдвигаясь назад на i
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      list.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`
      });
    }
    return list;
  };

  // Выбор месяца из архива
  const selectArchiveMonth = (year, month) => {
    setCurrentDate(new Date(year, month, 1));
    setArchiveVisible(false);
  };

  // Генерация сетки дней календаря
  const renderCalendarDays = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    
    // Сдвиг для стран, где неделя начинается с Понедельника
    const shift = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    const dayCells = [];

    // Пустые ячейки начала месяца
    for (let i = 0; i < shift; i++) {
      dayCells.push(<View key={`empty-${i}`} style={styles.dayCellEmpty} />);
    }

    // Рабочие ячейки дней
    for (let day = 1; day <= daysInMonth; day++) {
      const dayRecords = daysData[day];
      const totalSum = getDayTotal(dayRecords);
      const totalHours = getDayHours(dayRecords);

      dayCells.push(
        <TouchableOpacity key={`day-${day}`} style={styles.dayCell} onPress={() => openDayDetails(day)}>
          <Text style={styles.dayNumber}>{day}</Text>
          {totalSum > 0 ? (
            <View style={styles.dayInfoContainer}>
              <Text style={styles.dayHoursText}>{totalHours}ч</Text>
              <Text style={styles.daySumText}>{totalSum}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      );
    }

    return dayCells;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Шапка календаря */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.archiveButton} onPress={() => setArchiveVisible(true)}>
          <Text style={styles.headerTitle}>{monthNames[currentMonth]} {currentYear} ▾</Text>
        </TouchableOpacity>
        <View style={styles.totalMonthContainer}>
          <Text style={styles.totalMonthLabel}>Итого за месяц:</Text>
          <Text style={styles.totalMonthValue}>{getMonthTotal()} грн</Text>
        </View>
      </View>

      {/* Дни недели */}
      <View style={styles.weekDaysContainer}>
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
          <Text key={d} style={styles.weekDayText}>{d}</Text>
        ))}
      </View>

      {/* Сетка календаря */}
      <ScrollView contentContainerStyle={styles.calendarGrid}>
        {renderCalendarDays()}
      </ScrollView>

      {/* Модальное окно: Записи конкретного дня */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>День {selectedDay}-й ({monthNames[currentMonth]})</Text>
            
            {/* Список уже добавленных записей на сегодня */}
            <Text style={styles.sectionLabel}>Добавленные работы за сегодня:</Text>
            <ScrollView style={styles.recordsList}>
              {daysData[selectedDay]?.records && daysData[selectedDay].records.length > 0 ? (
                daysData[selectedDay].records.map((rec) => (
                  <View key={rec.id} style={styles.recordRow}>
                    <Text style={styles.recordText}>
                      {rec.rate} грн × {rec.hours} ч. = <Text style={styles.recordSum}>{rec.rate * rec.hours} грн</Text>
                    </Text>
                    <TouchableOpacity style={styles.deleteRecordButton} onPress={() => handleDeleteRecord(rec.id)}>
                      <Text style={styles.deleteRecordText}>🗑</Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyRecordsText}>Записей пока нет</Text>
              )}
            </ScrollView>

            {/* Итоговый подсчет за выбранный день */}
            <View style={styles.daySummaryBox}>
              <Text style={styles.daySummaryText}>
                Всего за день: <Text style={styles.daySummaryValue}>{getDayTotal(daysData[selectedDay])} грн</Text>
              </Text>
            </View>

            {/* Форма добавления новой записи */}
            <View style={styles.inputForm}>
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>Ставка (грн):</Text>
                <TextInput
                  style={styles.input}
                  placeholder="300"
                  keyboardType="numeric"
                  value={inputRate}
                  onChangeText={setInputRate}
                />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>Часы:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="3"
                  keyboardType="numeric"
                  value={inputHours}
                  onChangeText={setInputHours}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAddRecord}>
              <Text style={styles.addButtonText}>Добавить запись</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={saveDayAndClose}>
              <Text style={styles.closeButtonText}>Сохранить и закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Модальное окно: Архив на 12 месяцев */}
      <Modal visible={archiveVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.archiveContent}>
            <Text style={styles.modalTitle}>Архив за 12 месяцев</Text>
            <ScrollView style={styles.archiveScroll}>
              {getArchiveMonths().map((m, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.archiveRow} 
                  onPress={() => selectArchiveMonth(m.year, m.month)}
                >
                  <Text style={styles.archiveRowText}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={() => setArchiveVisible(false)}>
              <Text style={styles.closeButtonText}>Закрыть архив</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  header: { padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  archiveButton: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#EDF2F7', borderRadius: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#2D3748' },
  totalMonthContainer: { alignItems: 'flex-end' },
  totalMonthLabel: { fontSize: 12, color: '#718096' },
  totalMonthValue: { fontSize: 18, fontWeight: '800', color: '#2B6CB0' },
  weekDaysContainer: { flexDirection: 'row', backgroundColor: '#FFF', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  weekDayText: { flex: 1, textAlign: 'center', fontWeight: '600', color: '#A0AEC0', fontSize: 13 },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 4 },
  dayCell: { width: '13.4%', height: 85, backgroundColor: '#FFF', margin: '0.4%', borderRadius: 8, padding: 4, justifyContent: 'space-between', borderWidth: 1, borderBottomWidth: 2, borderColor: '#E2E8F0' },
  dayCellEmpty: { width: '13.4%', height: 85, margin: '0.4%' },
  dayNumber: { fontSize: 14, fontWeight: '700', color: '#4A5568' },
  dayInfoContainer: { alignItems: 'flex-end' },
  dayHoursText: { fontSize: 10, color: '#718096', fontWeight: '500' },
  daySumText: { fontSize: 11, fontWeight: '700', color: '#2F855A' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalContent: { width: '100%', backgroundColor: '#FFF', borderRadius: 16, padding: 20, maxHeight: '90%' },
  archiveContent: { width: '85%', backgroundColor: '#FFF', borderRadius: 16, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#2D3748', marginBottom: 16, textAlign: 'center' },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#718096', marginBottom: 6 },
  recordsList: { maxHeight: 160, backgroundColor: '#F7FAFC', borderRadius: 8, padding: 8, marginBottom: 12, borderWidth: 1, borderColor: '#EDF2F7' },
  recordRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  recordText: { fontSize: 14, color: '#4A5568' },
  recordSum: { fontWeight: '700', color: '#2F855A' },
  deleteRecordButton: { padding: 4, paddingHorizontal: 8 },
  deleteRecordText: { fontSize: 16, color: '#E53E3E' },
  emptyRecordsText: { textAlign: 'center', color: '#A0AEC0', marginVertical: 12, fontSize: 14 },
  daySummaryBox: { padding: 12, backgroundColor: '#EBF8FF', borderRadius: 8, marginBottom: 16, alignItems: 'center', borderWidth: 1, borderColor: '#BEE3F8' },
  daySummaryText: { fontSize: 15, fontWeight: '600', color: '#2B6CB0' },
  daySummaryValue: { fontWeight: '800', color: '#2B6CB0' },
  inputForm: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  inputWrap: { width: '48%' },
  inputLabel: { fontSize: 12, color: '#4A5568', marginBottom: 4, fontWeight: '500' },
  input: { backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#CBD5E0', borderRadius: 8, padding: 10, fontSize: 15, color: '#2D3748' },
  addButton: { backgroundColor: '#3182CE', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  addButtonText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  closeButton: { backgroundColor: '#EDF2F7', padding: 12, borderRadius: 8, alignItems: 'center' },
  closeButtonText: { color: '#4A5568', fontWeight: '700', fontSize: 15 },
  archiveScroll: { marginVertical: 12 },
  archiveRow: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#EDF2F7', alignItems: 'center' },
  archiveRowText: { fontSize: 16, color: '#2D3748', fontWeight: '500' }
});
