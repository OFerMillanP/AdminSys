Set ws = WScript.CreateObject("WScript.Shell")
Set fso = WScript.CreateObject("Scripting.FileSystemObject")

batchPath = fso.BuildPath(fso.GetParentFolderName(WScript.ScriptFullName), "runadminsys-windows.bat")
escapedBatchPath = Replace(batchPath, "'", "''")
msgCommand = "(New-Object -ComObject WScript.Shell).Popup('AdminSys is running, wait...', 10, 'AdminSys', 64) | Out-Null;"
psCommand = "$mutex = New-Object System.Threading.Mutex($false, 'Local\AdminSysLauncher'); " & _
	"function Test-AdminSysRunning { foreach ($port in @(8000, 8100, 8101)) { $client = New-Object System.Net.Sockets.TcpClient; " & _
	"try { $client.Connect('127.0.0.1', $port); $client.Close(); return $true } catch { $client.Close() } }; return $false }; " & _
	"if ($mutex.WaitOne(0)) { try { if (Test-AdminSysRunning) { exit }; " & _
	"& '" & escapedBatchPath & "'; " & _
	"$deadline = (Get-Date).AddSeconds(60); " & _
	"while (-not (Test-AdminSysRunning) -and (Get-Date) -lt $deadline) { Start-Sleep -Seconds 1 }; " & _
	"while (Test-AdminSysRunning) { Start-Sleep -Seconds 2 } " & _
	"} finally { $mutex.ReleaseMutex(); $mutex.Dispose() } }"

ws.Run "powershell.exe -NoProfile -WindowStyle Hidden -Command """ & msgCommand & """"& psCommand & """", 0, False