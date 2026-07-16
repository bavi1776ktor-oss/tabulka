        {/* Модалка для сообщения от администратора */}
        <Modal visible={adminMessageModalVisible} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, styles.adminMessageModal]}>
              <Text style={[styles.modalTitle, { color: '#10B981' }]}>{t.messageFromAdmin}</Text>
              <ScrollView style={styles.adminMessageScroll}>
                <Text style={styles.adminMessageText}>{adminMessageText}</Text>
                {adminMessageLink ? (
                  <TouchableOpacity 
                    style={styles.adminMessageLinkBtn} 
                    onPress={() => { Linking.openURL(adminMessageLink); }}
                  >
                    <Text style={styles.adminMessageLinkText}>{t.adminMessageLink}</Text>
                  </TouchableOpacity>
                ) : null}
              </ScrollView>
              <TouchableOpacity 
                style={styles.adminMessageCloseBtn} 
                onPress={markMessageAsRead}
              >
                <Text style={styles.adminMessageCloseBtnText}>Закрыть</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
