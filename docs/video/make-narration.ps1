# make-narration.ps1 — SAPI TTS narration segments for the MEDIUM demo video
Add-Type -AssemblyName System.Speech
$outDir = "D:/work/agents/zcode/medium/docs/video"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$segments = @(
  @{ id = "A"; text = "This program has been dead for thirty years. It is running in a browser. And when I ask about it, the answer points at the exact bytes it came from." },
  @{ id = "B"; text = "Forgotten software survives as files nobody can run or understand. MEDIUM is a seance machine. It runs a dead program on a transparent byte machine, reads its memory while it works, and turns observation into a checkable archive." },
  @{ id = "C"; text = "Here is the full loop. The Coroner reads a real file and cites byte offsets. Crypt Keeper is sealed. The seance finds the passcode: one byte at hex 140, the letter W. The door opens, and the evidence lights up the memory it came from." },
  @{ id = "D"; text = "Now, the failure mode. This claim cites evidence that does not exist. The gate blocks it, publicly. And when the bytes are silent, a dead sector, MEDIUM says unknown, and leaves it unknown." },
  @{ id = "E"; text = "Everything the seance established exports as one file: hashes, evidence, claims. It was built spec first in Kiro. The repository carries the specs, the hooks, an MCP server, and property tests." },
  @{ id = "F"; text = "In 1920, Edison announced a machine to speak with the dead. It never worked. This one does. Not because it channels anything, but because it reads." }
)

$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
try { $synth.SelectVoice("Microsoft Zira Desktop") } catch { try { $synth.SelectVoice("Microsoft Zira") } catch {} }
$synth.Rate = 0
foreach ($seg in $segments) {
  $path = Join-Path $outDir ("narration-" + $seg.id + ".wav")
  $synth.SetOutputToWaveFile($path)
  $synth.Speak($seg.text)
  $synth.SetOutputToDefaultAudioDevice()
  Write-Host ("wrote " + $path)
}
$synth.Dispose()
