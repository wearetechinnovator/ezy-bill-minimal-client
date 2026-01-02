import { Message, useToaster } from "rsuite";

const useMyToaster = () => {
  const toaster = useToaster();

  const toast = (msg, type) => {
    const message = (
      <Message showIcon type={type} closable>
        {msg}
      </Message>
    );

    toaster.push(message, {
      duration: 2000,
      placement: "bottomEnd"
    });

  }

  return toast;
}

export default useMyToaster;
