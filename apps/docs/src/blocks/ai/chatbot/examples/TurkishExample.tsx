import { AttachIconOutlinedRounded } from '@takeoff-icons/react/attach';
import { CameraIconOutlinedRounded } from '@takeoff-icons/react/camera';
import { ChatIconOutlinedRounded } from '@takeoff-icons/react/chat';
import { PdfIconOutlinedRounded } from '@takeoff-icons/react/pdf';
import { Chatbot, type ChatbotAttachmentOption, type ChatbotLabels, type ChatbotMessage } from '../Chatbot';
import { useDemoConversation } from '../useDemoConversation';

/** Turkish texts for the block. Keep them next to your other translations. */
const trLabels: ChatbotLabels = {
  subtitle: 'Sohbet',
  online: 'Çevrimiçi',
  offline: 'Çevrimdışı',
  typing: 'Yazıyor…',
  moreOptions: 'Diğer seçenekler',
  closeChat: 'Sohbeti kapat',
  expand: 'Tam ekran',
  collapse: 'Tam ekrandan çık',
  conversation: title => `${title} ile sohbet`,
  isTyping: name => `${name} yazıyor`,
  offlineNotice: 'Şu anda çevrimdışıyız. Lütfen daha sonra tekrar deneyin.',
  placeholder: 'Mesajınızı yazın',
  listening: 'Dinleniyor…',
  message: 'Mesaj',
  send: 'Mesajı gönder',
  attachFiles: 'Dosya ekle',
  attachments: 'Ekler',
  removeFile: name => `${name} dosyasını kaldır`,
  voiceInput: 'Sesli yaz',
  stopVoiceInput: 'Sesli yazmayı durdur',
  characters: (count, max) => `${max} karakterden ${count}`,
  sending: 'Gönderiliyor',
  sent: 'Gönderildi',
  read: 'Okundu',
  notDelivered: 'İletilemedi',
  notSent: 'Gönderilemedi',
  retry: 'Tekrar dene',
  undo: 'Geri al',
  retracted: 'Bu mesajı geri aldınız',
  somethingWentWrong: 'Bir sorun oluştu',
  copy: 'Kopyala',
  copied: 'Kopyalandı',
  copiedToClipboard: 'Panoya kopyalandı',
  goodResponse: 'İyi cevap',
  badResponse: 'Kötü cevap',
  regenerate: 'Yeniden yanıtla',
  suggestions: 'Önerilen sorular',
  sources: 'Kaynaklar',
  newMessages: count => `${count} yeni mesaj`,
  newMessagesDivider: 'Yeni mesajlar',
  loadOlder: 'Önceki mesajları yükle',
  loading: 'Mesajlar yükleniyor',
  startChat: 'Sohbeti başlat',
  openChat: (title, unread) => (unread > 0 ? `${title} ile sohbet et, ${unread} okunmamış mesaj` : `${title} ile sohbet et`),
  hideChat: 'Sohbeti gizle',
  dismissGreeting: 'Mesajı kapat',
  rating: (value, max) => `${max} üzerinden ${value} yıldız`,
  ratingThanks: 'Geri bildiriminiz için teşekkürler!',
};

const trAttachmentOptions: ChatbotAttachmentOption[] = [
  { label: 'Fotoğraf veya video', icon: <CameraIconOutlinedRounded />, accept: 'image/*,video/*' },
  { label: 'Belge', icon: <PdfIconOutlinedRounded />, accept: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt' },
  { label: 'Herhangi bir dosya', icon: <AttachIconOutlinedRounded /> },
];

const conversation: ChatbotMessage[] = [
  { id: '1', role: 'assistant', content: 'Merhaba, ben Takeoff bot. Seyahatinizle ilgili nasıl yardımcı olabilirim?', time: '20:12' },
  { id: '2', role: 'user', content: 'Rezervasyonuma ek bagaj ekleyebilir miyim?', time: '20:13', status: 'read' },
  {
    id: '3',
    role: 'assistant',
    content: 'Evet. Kalkıştan 3 saat öncesine kadar en fazla 2 parça ek bagaj ekleyebilirsiniz.',
    time: '20:13',
    suggestions: ['Ücreti ne kadar?', 'Bagaj sayfasını aç'],
  },
];

export default function TurkishExample() {
  const { messages, setMessages, typing, submit, retry, rate } = useDemoConversation(conversation, {
    answerWith: text => `“${text}” sorunuzu aldım. Bu demo hazır bir cevap verir; onSubmit'i kendi servisinize bağlayın.`,
  });

  return (
    <div className="flex w-full justify-center">
      <Chatbot
        type="divided"
        labels={trLabels}
        attachmentOptions={trAttachmentOptions}
        messages={messages}
        typing={typing}
        onSubmit={submit}
        onRetry={retry}
        onFeedback={rate}
        copyable
        menuItems={[{ label: 'Yeni sohbet', icon: <ChatIconOutlinedRounded />, onSelect: () => setMessages([conversation[0]]) }]}
        disclaimer="Cevaplar yapay zekâ ile üretilir. Önemli bilgileri kontrol edin."
        userAvatar="/img/blocks/chatbot/user-avatar.svg"
      />
    </div>
  );
}
