import Swal, { SweetAlertOptions } from 'sweetalert2';

// Metro UI SweetAlert2 configuration
const metroSwalConfig = {
  customClass: {
    popup: 'metro-swal-popup',
    title: 'metro-swal-title',
    htmlContainer: 'metro-swal-content',
    confirmButton: 'metro-swal-confirm',
    cancelButton: 'metro-swal-cancel',
    icon: 'metro-swal-icon'
  },
  background: '#000000',
  color: '#ffffff',
  buttonsStyling: false
} as const;

// Metro UI SweetAlert2 wrapper functions
export const MetroSwal = {
  fire: (options: SweetAlertOptions | string, text?: string, icon?: any) => {
    if (typeof options === 'string') {
      // Handle legacy string format
      const config: SweetAlertOptions = {
        title: options,
        text: text,
        icon: icon,
        customClass: metroSwalConfig.customClass,
        background: metroSwalConfig.background,
        color: metroSwalConfig.color,
        buttonsStyling: metroSwalConfig.buttonsStyling
      };
      return Swal.fire(config);
    } else {
      // Handle object format
      const config: SweetAlertOptions = {
        ...options,
        customClass: {
          ...metroSwalConfig.customClass,
          ...options.customClass
        },
        background: options.background || metroSwalConfig.background,
        color: options.color || metroSwalConfig.color,
        buttonsStyling: options.buttonsStyling !== undefined ? options.buttonsStyling : metroSwalConfig.buttonsStyling
      };
      return Swal.fire(config);
    }
  },

  success: (title: string, text?: string) => {
    const config: SweetAlertOptions = {
      title,
      text,
      icon: 'success',
      customClass: metroSwalConfig.customClass,
      background: metroSwalConfig.background,
      color: metroSwalConfig.color,
      buttonsStyling: metroSwalConfig.buttonsStyling
    };
    return Swal.fire(config);
  },

  error: (title: string, text?: string) => {
    const config: SweetAlertOptions = {
      title,
      text,
      icon: 'error',
      customClass: metroSwalConfig.customClass,
      background: metroSwalConfig.background,
      color: metroSwalConfig.color,
      buttonsStyling: metroSwalConfig.buttonsStyling
    };
    return Swal.fire(config);
  },

  warning: (title: string, text?: string) => {
    const config: SweetAlertOptions = {
      title,
      text,
      icon: 'warning',
      customClass: metroSwalConfig.customClass,
      background: metroSwalConfig.background,
      color: metroSwalConfig.color,
      buttonsStyling: metroSwalConfig.buttonsStyling
    };
    return Swal.fire(config);
  },

  info: (title: string, text?: string) => {
    const config: SweetAlertOptions = {
      title,
      text,
      icon: 'info',
      customClass: metroSwalConfig.customClass,
      background: metroSwalConfig.background,
      color: metroSwalConfig.color,
      buttonsStyling: metroSwalConfig.buttonsStyling
    };
    return Swal.fire(config);
  },

  confirm: (title: string, text?: string) => {
    const config: SweetAlertOptions = {
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: metroSwalConfig.customClass,
      background: metroSwalConfig.background,
      color: metroSwalConfig.color,
      buttonsStyling: metroSwalConfig.buttonsStyling
    };
    return Swal.fire(config);
  }
};

export default MetroSwal;