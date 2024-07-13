import * as Sentry from "@sentry/nextjs";
import { registerOTel } from "@vercel/otel";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

import type {
  ReadableSpan,
  Span,
  SpanProcessor,
  SpanExporter,
} from "@opentelemetry/sdk-trace-base";
import { ExportResult } from "@opentelemetry/core";

class NextJsSpanProcessor implements SpanProcessor {
  forceFlush(): Promise<void> {
    return Promise.resolve();
  }
  onEnd(span: ReadableSpan): void {}
  shutdown(): Promise<void> {
    return Promise.resolve();
  }

  onStart(span: Span): void {
    console.log(
      "span.spanContext().traceId",
      span.spanContext().traceId,
      span.spanContext().spanId,
      span.instrumentationLibrary.name
    );
  }
}

class CustomSpanExporter implements SpanExporter {
  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ): void {}
  shutdown(): Promise<void> {
    return Promise.resolve();
  }
  forceFlush?(): Promise<void> {
    return Promise.resolve();
  }
}

export function register() {
  registerOTel({
    spanProcessors: [new NextJsSpanProcessor(), "auto"],
    traceExporter: new CustomSpanExporter(),
  });

  Sentry.init({
    tracesSampleRate: 1.0,
    skipOpenTelemetrySetup: true,
    dsn: SENTRY_DSN,
  });
}
