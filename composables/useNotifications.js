export function useNotifications() {
    const showNotification = (title, options) => {
      const supportsNotifications = () => {
        return typeof window !== 'undefined' && 'Notification' in window;
      };
      
      if (supportsNotifications()) {
        // Здесь можно безопасно использовать уведомления
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification(title, options);
          } else {
            console.log('Уведомление было запрещено');

          }
        });
      } else {
        // console.warn('Уведомления не поддерживаются в вашем браузере.');
      }
    };
  
    return { showNotification };
  }

