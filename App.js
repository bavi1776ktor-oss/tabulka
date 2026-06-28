if (isTrialExpired) {
    return (
      <SafeAreaView style={styles.authContainer}>
        <View style={[styles.authCard, { borderColor: '#EF4444', borderWidth: 1.5 }]}>
          <Text style={[styles.authTitle, { color: '#EF4444' }]}>Срок пробного тестирования (7 дней) окончен</Text>
          
          <Text style={[styles.authSubtitle, { marginBottom: 10, fontWeight: 'bold' }]}>Запросить полную версию:</Text>
          <TextInput placeholder="Ваше Имя" style={[styles.authInput, { marginBottom: 10 }]} value={clientName} onChangeText={setClientName} />
          <TextInput placeholder="Телефон" keyboardType="phone-pad" style={[styles.authInput, { marginBottom: 15 }]} value={clientPhone} onChangeText={setClientPhone} />
          <TouchableOpacity style={[styles.authButton, { backgroundColor: '#10B981', marginBottom: 5 }]} onPress={handleSendSupportRequest}>
            <Text style={styles.authButtonText}>Отправить запрос</Text>
          </TouchableOpacity>
          {/* Исправленный текст строго под кнопкой */}
          <Text style={styles.noticeSubText}>Введите Ваше имя и телефон ,ожидайте Вам перезвонят</Text>

          <View style={{ marginVertical: 15, borderBottomWidth: 1, borderColor: '#E5E7EB' }} />

          <Text style={[styles.authSubtitle, { marginBottom: 10, fontWeight: 'bold' }]}>Ввести постоянный ключ:</Text>
          <TextInput
            placeholder="Постоянный ключ активации"
            autoCapitalize="characters"
            style={styles.authInput}
            value={inputPassword}
            onChangeText={setInputPassword}
          />
          <TouchableOpacity style={[styles.authButton, { backgroundColor: '#0052CC' }]} onPress={handleLogin}>
            <Text style={styles.authButtonText}>Активировать</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isCurrentModeTrial = password && password.startsWith("TRIAL_MODE_");

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* ... Весь остальной интерфейс календаря остается без изменений ... */}

        {/* Модальное окно запроса, когда триал еще идет */}
        <Modal visible={requestModalVisible} transparent={true} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Отправить запрос</Text>
              <TextInput placeholder="Ваше Имя" style={styles.input} value={clientName} onChangeText={setClientName} />
              <TextInput placeholder="Телефон" keyboardType="phone-pad" style={styles.input} value={clientPhone} onChangeText={setClientPhone} />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.btn, styles.btnSave, { backgroundColor: '#10B981' }]} onPress={handleSendSupportRequest}>
                  <Text style={styles.btnText}>Отправить запрос</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setRequestModalVisible(false)}>
                  <Text style={styles.btnText}>Отмена</Text>
                </TouchableOpacity>
              </View>
              
              {/* Исправленный текст строго под блоком отправки */}
              <Text style={[styles.noticeSubText, { marginTop: 10 }]}>Введите Ваше имя и телефон ,ожидайте Вам перезвонят</Text>
            </View>
          </View>
        </Modal>

        {/* ... Остальные модальные окна (архив, редактирование дня) ... */}
      </View>
    </SafeAreaView>
  );
