import Swal from "sweetalert2";
export const StartLoading = (msg) => {
    Swal.fire({
        title: msg,
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading()
            setTimeout(() => {
                Swal.close();
            }, 1000);
        }
    });
}

export const CloseLoading = () => {
    Swal.close();
}

export const SuccessSwal = (title, text) => {
    Swal.fire({
        title,
        text,
        showConfirmButton: false,
        timer: 1000
    });
}

export const ErrorSwal = (msg) => {
    Swal.fire({
        title: msg,
        icon: "error",
        showConfirmButton: false,
        timer: 1000
    });
}

export const ConfirmationSwal = (confirmCb, cancelCb) => {
    Swal.fire({
        title: 'Apakah Anda Yakin?',
        text: 'Anda tidak akan dapat mengembalikan ini!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
    }).then((result) => {
        if (result.isConfirmed) {
            confirmCb();
        } else if (result.isDismissed) {
            cancelCb()
        }
    });
}

export const ConfirmationSwal1 = (confirmCb, cancelCb) => {
    Swal.fire({
        title: 'Apakah Anda Yakin?',
        text: 'Anda tidak akan dapat mengembalikan ini!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        html: '<input type="file" id="fileInput">',
    }).then((result) => {
        if (result.isConfirmed) {
            confirmCb();
        } else if (result.isDismissed) {
            cancelCb()
        }
    });
}

export const InputSwal = async (title, placeholder, callback) => {
    const { value: note } = await Swal.fire({
        input: "textarea",
        inputLabel: title,
        icon: 'warning',
        inputPlaceholder: placeholder,
        inputAttributes: {
            "aria-label": placeholder,
        },
        showCancelButton: true,
    });

    if (note) {
        callback(note);
    }
};



