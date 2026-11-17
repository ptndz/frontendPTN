import { Component, ReactNode } from "react";
import { useCallStore } from "../../store/call";
import { useI18n } from "../../i18n/I18nProvider";
import { Stack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { Button } from "@astryxdesign/core/Button";

/**
 * Lưới an toàn cho (a) — crash `insertBefore` chưa tái hiện được nên
 * KHÔNG sửa mù logic Dialog/modal. Thay vào đó bọc vùng render
 * CallModal/IncomingCallModal: nếu modal render lỗi, chỉ modal sập,
 * trang Messenger (và toàn app) vẫn sống.
 *
 * Đây là biện pháp phòng vệ + chẩn đoán, KHÔNG phải che lỗi: lỗi vẫn
 * được log đầy đủ ra console kèm React component stack
 * (errorInfo.componentStack) để lần sau bắt được stack thật.
 * Fallback dùng component Astryx + token Mono, không dùng raw stylex.
 */
class CallErrorBoundaryInner extends Component<
  { children: ReactNode; title: string; body: string; dismiss: string },
  { hasError: boolean }
> {
  constructor(props: {
    children: ReactNode;
    title: string;
    body: string;
    dismiss: string;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack?: string | null }): void {
    // Log đầy đủ để chẩn đoán lần sau — kể cả component stack của React.
    // Đồng thời dọn state cuộc gọi (dừng micro/camera, đóng mesh) để
    // không kẹt ở trạng thái "calling" sau khi modal đã sập.
    // eslint-disable-next-line no-console
    console.error("[CallErrorBoundary] Call modal crashed:", error, errorInfo.componentStack);
    try {
      useCallStore.getState()._cleanup();
    } catch {
      // Cleanup lỗi thì thôi — fallback vẫn phải hiện cho user.
    }
  }

  private handleDismiss = (): void => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Stack gap={3} hAlign="center" className="bg-paper border border-line rounded-xl p-4 m-4">
          <Text weight="semibold">{this.props.title}</Text>
          <Text size="sm" color="secondary" className="text-center">
            {this.props.body}
          </Text>
          <Button
            size="sm"
            variant="secondary"
            label={this.props.dismiss}
            onClick={this.handleDismiss}
          />
        </Stack>
      );
    }
    return this.props.children;
  }
}

/** Wrapper hàm để lấy chuỗi i18n cho class boundary. */
export default function CallErrorBoundary({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  return (
    <CallErrorBoundaryInner
      title={t("messenger.call.callCrashTitle")}
      body={t("messenger.call.callCrashBody")}
      dismiss={t("messenger.call.callCrashDismiss")}>
      {children}
    </CallErrorBoundaryInner>
  );
}
