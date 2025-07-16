import { metrics } from '@opentelemetry/api'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch'
import { browserDetector } from '@opentelemetry/opentelemetry-browser-detector'
import {
  detectResources,
  resourceFromAttributes,
} from '@opentelemetry/resources'
import {
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics'
import { BatchSpanProcessor, WebTracerProvider } from '@opentelemetry/sdk-trace-web'
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions'
import { logger } from '@workspace/core/utils/logger'
import { ENV } from '@/core/constants/env'
import { SERVICE_NAME, SERVICE_VERSION } from '@/core/constants/global'

let resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: SERVICE_NAME,
  [ATTR_SERVICE_VERSION]: SERVICE_VERSION,
})
const detectedResources = detectResources({ detectors: [browserDetector] })
resource = resource.merge(detectedResources)

/**
 * WebTracerProvider already includes:
 * new W3CTraceContextPropagator()
 * new W3CBaggagePropagator()
 */
const tracerProvider = new WebTracerProvider({
  resource,
  spanProcessors: [
    new BatchSpanProcessor(new OTLPTraceExporter({
      url: ENV.VITE_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
    })),
    // new SimpleSpanProcessor(new ConsoleSpanExporter()),
  ],
})

const meterProvider = new MeterProvider({
  resource,
  readers: [
    new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: ENV.VITE_OTEL_EXPORTER_OTLP_METRICS_ENDPOINT,
      }),
      exportIntervalMillis: 10_000,
    }),
    // new PeriodicExportingMetricReader({
    //   exporter: new ConsoleMetricExporter(),
    //   exportIntervalMillis: 5_000,
    // }),
  ],
})

tracerProvider.register()
metrics.setGlobalMeterProvider(meterProvider)
registerInstrumentations({
  instrumentations: [
    new FetchInstrumentation({
      ignoreUrls: [
        /api\.iconify\.design/,
        new RegExp(ENV.VITE_FLAGSMITH_API_URL),
      ],
    }),
  ],
})

logger.log('Instrumentation completed')
