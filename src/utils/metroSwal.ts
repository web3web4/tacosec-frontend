import Swal, { SweetAlertIcon, SweetAlertOptions } from 'sweetalert2';

// Metro UI SweetAlert2 configuration
const metroSwalConfig = {
  customClass: {
    popup: 'metro-swal-popup',
    title: 'metro-swal-title',
    htmlContainer: 'metro-swal-content',
    confirmButton: 'metro-swal-confirm',
    denyButton: 'metro-swal-cancel',
    cancelButton: 'metro-swal-cancel',
    icon: 'metro-swal-icon'
  },
  buttonsStyling: false
} as const;

// Metro UI SweetAlert2 wrapper functions
export const MetroSwal = {
  fire: (options: SweetAlertOptions | string, text?: string, icon?: SweetAlertIcon | undefined) => {
    if (typeof options === 'string') {
      // Handle legacy string format
      const config: SweetAlertOptions = {
        title: options,
        text: text,
        icon: icon,
        customClass: metroSwalConfig.customClass,
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
      buttonsStyling: metroSwalConfig.buttonsStyling
    };
    return Swal.fire(config);
  }
};

export default MetroSwal;