import * as Sentry from "@sentry/nextjs";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import {
  SentrySpanProcessor,
  SentryPropagator,
  SentrySampler,
} from "@sentry/opentelemetry";
import type {
  ReadableSpan,
  Span,
  SpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import {
  CompositePropagator,
  W3CTraceContextPropagator,
  W3CBaggagePropagator,
} from "@opentelemetry/core";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

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

export function register() {
  const sentryClient = Sentry.init({
    tracesSampleRate: 1.0,
    skipOpenTelemetrySetup: true,
    dsn: SENTRY_DSN,
  });

  const provider = new NodeTracerProvider({
    sampler: (sentryClient as any)
      ? new SentrySampler(sentryClient as any)
      : undefined,
  });

  provider.addSpanProcessor(new SentrySpanProcessor());
  provider.addSpanProcessor(new NextJsSpanProcessor());

  const propagator = new CompositePropagator({
    propagators: [
      new SentryPropagator(),
      new W3CTraceContextPropagator(),
      new W3CBaggagePropagator(),
    ],
  });

  provider.register({
    propagator,
    contextManager: new Sentry.SentryContextManager(),
  });

  Sentry.validateOpenTelemetrySetup();
}
