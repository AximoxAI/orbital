import { ChevronDown, Terminal, Circle } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import React from "react"

interface LogsPanelProps {
  logs: string[]
  logsOpen: boolean
  setLogsOpen: React.Dispatch<React.SetStateAction<boolean>>
  showMonacoCanvas: boolean
}

const TypewriterText: React.FC<{ text: string; delay: number; shouldAnimate: boolean }> = ({ text, delay, shouldAnimate }) => {
  const [displayed, setDisplayed] = React.useState(shouldAnimate ? "" : text)
  const [idx, setIdx] = React.useState(shouldAnimate ? 0 : text.length)
  const [cursor, setCursor] = React.useState(shouldAnimate)

  React.useEffect(() => {
    if (!shouldAnimate) {
      setDisplayed(text)
      setIdx(text.length)
      setCursor(false)
      return
    }
    const timer = setTimeout(() => {
      if (idx < text.length) {
        setDisplayed(text.slice(0, idx + 1))
        setIdx(idx + 1)
      } else {
        setTimeout(() => setCursor(false), 1000) // Increased from 500ms to 1000ms
      }
    }, delay * 1000 + idx * 20) // Increased from 8ms to 20ms per character
    return () => clearTimeout(timer)
  }, [idx, text, delay, shouldAnimate])

  React.useEffect(() => {
    if (shouldAnimate) {
      setDisplayed("")
      setIdx(0)
      setCursor(true)
    } else {
      setDisplayed(text)
      setIdx(text.length)
      setCursor(false)
    }
  }, [text, shouldAnimate])

  return (
    <span>
      {displayed}
      {cursor && idx < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 1.0, repeat: Infinity, repeatType: "reverse" }} // Increased from 0.6s to 1.0s
          className="inline-block w-0.5 h-4 bg-primary ml-0.5"
        />
      )}
    </span>
  )
}

const LogsPanel: React.FC<LogsPanelProps> = ({ logs, logsOpen, setLogsOpen, showMonacoCanvas }) => {
  const [animatedLogs, setAnimatedLogs] = React.useState<Set<string>>(new Set())

  React.useEffect(() => {
    setAnimatedLogs(prev => {
      const updated = new Set(prev)
      logs.forEach((log, idx) => updated.add(`${idx}-${log}`))
      return updated
    })
  }, [logs])

  if (!showMonacoCanvas || logs.length === 0) return null

  return (
    <div className="mx-6 mb-2">
      <Card className="shadow-sm border-border/50">
        <Collapsible open={logsOpen} onOpenChange={setLogsOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-3 pt-4 cursor-pointer bg-muted/50 transition-colors hover:bg-muted/70">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Terminal className="h-4 w-4 text-muted-foreground" />
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                      Execution Logs
                    </h3>
                    <Badge variant="secondary" className="text-xs">{logs.length}</Badge>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <motion.div
                    animate={{ rotate: logsOpen ? 0 : -90 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }} // Increased from 0.2s to 0.4s
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </Button>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <ScrollArea className="h-[180px] w-full rounded-md border bg-muted/20 p-4">
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {logs.map((line, idx) => {
                      const logKey = `${idx}-${line}`
                      const isNew = !animatedLogs.has(logKey)
                      return (
                        <motion.div
                          key={logKey}
                          initial={isNew ? { opacity: 0, y: 10, scale: 0.98 } : false}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.98 }}
                          transition={{
                            duration: isNew ? 0.6 : 0, // Increased from 0.3s to 0.6s
                            delay: isNew ? idx * 0.08 : 0, // Increased from 0.02s to 0.08s
                            ease: "easeOut",
                          }}
                          className="flex items-start gap-3 group"
                        >
                          <div className="flex flex-col items-center">
                            <motion.div
                              initial={isNew ? { scale: 0 } : false}
                              animate={{ scale: 1 }}
                              transition={{
                                duration: isNew ? 0.3 : 0, // Increased from 0.1s to 0.3s
                                delay: isNew ? idx * 0.08 + 0.15 : 0, // Increased delays
                                type: "spring",
                                stiffness: 300, // Reduced from 400 to 300 for slower spring
                                damping: 30, // Increased from 25 to 30 for less bounce
                              }}
                            >
                              <Circle className="h-2 w-2 fill-primary text-primary mt-2" />
                            </motion.div>
                            {idx < logs.length - 1 && (
                              <motion.div
                                initial={isNew ? { height: 0, opacity: 0 } : false}
                                animate={{ height: 24, opacity: 1 }}
                                transition={{
                                  duration: isNew ? 0.4 : 0, // Increased from 0.1s to 0.4s
                                  delay: isNew ? idx * 0.08 + 0.25 : 0, // Increased delays
                                  ease: "easeOut",
                                }}
                                className="w-px bg-border mt-1"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 pt-1">
                            <motion.p
                              initial={isNew ? { opacity: 0 } : false}
                              animate={{ opacity: 1 }}
                              transition={{
                                duration: isNew ? 0.5 : 0, // Increased from 0.2s to 0.5s
                                delay: isNew ? idx * 0.08 + 0.2 : 0, // Increased delays
                                ease: "easeOut",
                              }}
                              className="text-sm text-foreground font-mono leading-relaxed break-all"
                            >
                              <TypewriterText text={line} delay={isNew ? idx * 0.08 + 0.3 : 0} shouldAnimate={isNew} />
                            </motion.p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  )
}

export default LogsPanel