param(
    [Parameter(Mandatory = $true)][string]$Root,
    [Parameter(Mandatory = $true)][string]$Out,
    [int]$Limit = 0
)

Add-Type -AssemblyName System.Runtime.WindowsRuntime

$ok = $false
for ($i = 0; $i -lt 10 -and -not $ok; $i++) {
    try {
        [Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime] | Out-Null
        $null = [Windows.Media.Ocr.OcrEngine]::AvailableRecognizerLanguages
        $ok = $true
    } catch { Start-Sleep -Milliseconds 120 }
}
if (-not $ok) { throw "FATAL: OcrEngine unresolvable" }

# Engines FIRST, before any Streams object exists.
$enEngine = $null
try {
    [Windows.Globalization.Language, Windows.Foundation, ContentType = WindowsRuntime] | Out-Null
    $enEngine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage((New-Object Windows.Globalization.Language('en-US')))
} catch { }
$fallback = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
$engine = if ($enEngine) { $enEngine } else { $fallback }
$engineTag = $engine.RecognizerLanguage.LanguageTag

[Windows.Graphics.Imaging.BitmapDecoder, Windows.Foundation, ContentType = WindowsRuntime] | Out-Null
[Windows.Storage.Streams.InMemoryRandomAccessStream, Windows.Foundation, ContentType = WindowsRuntime] | Out-Null
[Windows.Storage.Streams.DataWriter, Windows.Foundation, ContentType = WindowsRuntime] | Out-Null

$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() |
    Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]
function Await($WinRtTask, $ResultType) {
    $asTask = $asTaskGeneric.MakeGenericMethod($ResultType)
    $netTask = $asTask.Invoke($null, @($WinRtTask))
    $netTask.Wait(-1) | Out-Null
    $netTask.Result
}

$exts = @('.png', '.jpg', '.jpeg', '.webp', '.bmp', '.gif')
$all = Get-ChildItem -Path $Root -Recurse -File |
    Where-Object { $exts -contains $_.Extension.ToLower() } |
    Sort-Object FullName
if ($Limit -gt 0) { $all = $all | Select-Object -First $Limit }

$sw = New-Object System.IO.StreamWriter($Out, $false, [System.Text.UTF8Encoding]::new($false))
$n = 0
foreach ($f in $all) {
    $n++
    $rec = [ordered]@{
        path = $f.FullName
        name = $f.Name
        bytes = $f.Length
        engine = $engineTag
        ok = $false
        w = 0
        h = 0
        ms = 0
        lines = @()
        error = $null
    }
    try {
        $ras = New-Object Windows.Storage.Streams.InMemoryRandomAccessStream
        $writer = New-Object Windows.Storage.Streams.DataWriter($ras)
        $writer.WriteBytes([System.IO.File]::ReadAllBytes($f.FullName))
        Await ($writer.StoreAsync()) ([uint32]) | Out-Null
        $writer.DetachStream() | Out-Null
        $ras.Seek(0)
        $decoder = Await ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($ras)) ([Windows.Graphics.Imaging.BitmapDecoder])
        $bmp = Await ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
        $t0 = Get-Date
        $res = Await ($engine.RecognizeAsync($bmp)) ([Windows.Media.Ocr.OcrResult])
        $rec.ms = [int]((Get-Date) - $t0).TotalMilliseconds
        $rec.w = $decoder.PixelWidth
        $rec.h = $decoder.PixelHeight
        $rows = @()
        foreach ($ln in @($res.Lines)) {
            $words = @($ln.Words)
            if ($words.Count -eq 0) { continue }
            $w0 = $words[0]
            $wN = $words[$words.Count - 1]
            $rows += [ordered]@{
                t = $ln.Text
                x = [int]$w0.BoundingRect.X
                y = [int]$w0.BoundingRect.Y
                r = [int]($wN.BoundingRect.X + $wN.BoundingRect.Width)
                h = [int]$w0.BoundingRect.Height
            }
        }
        $rec.lines = $rows
        $rec.ok = $true
    } catch {
        $rec.error = $_.Exception.Message
    }
    $sw.WriteLine(($rec | ConvertTo-Json -Depth 6 -Compress))
    if ($n % 25 -eq 0) { Write-Host "  $n / $($all.Count)" }
}
$sw.Close()
Write-Host "DONE: $n images -> $Out (engine $engineTag)"