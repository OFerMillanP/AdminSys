Set ws = WScript.CreateObject("WScript.Shell")
Set fso = WScript.CreateObject("Scripting.FileSystemObject")

batchPath = fso.BuildPath(fso.GetParentFolderName(WScript.ScriptFullName), "runadminsys-windows.bat")
projectPath = fso.GetParentFolderName(WScript.ScriptFullName)
escapedBatchPath = Replace(batchPath, "'", "''")
escapedProjectPath = Replace(projectPath, "'", "''")
psCommand = "$mutex = New-Object System.Threading.Mutex($false, 'Local\AdminSysLauncher'); " & _
	"function Test-AdminSysRunning { foreach ($port in @(8000, 8100, 8101)) { $client = New-Object System.Net.Sockets.TcpClient; " & _
	"try { $client.Connect('127.0.0.1', $port); $client.Close(); return $true } catch { $client.Close() } }; return $false }; " & _
	"function Test-AdminSysReady { $client = New-Object System.Net.Sockets.TcpClient; " & _
	"try { $client.Connect('127.0.0.1', 8000); return $true } catch { return $false } finally { $client.Dispose() } }; " & _
	"function Stop-AdminSysProcessTree { param([int]$processId, $processes); " & _
	"foreach ($child in @($processes | Where-Object { $_.ParentProcessId -eq $processId })) { Stop-AdminSysProcessTree $child.ProcessId $processes }; " & _
	"if (Get-Process -Id $processId -ErrorAction SilentlyContinue) { Stop-Process -Id $processId -Force -ErrorAction Stop } }; " & _
	"function Stop-AdminSysInstances { $connections = @(Get-NetTCPConnection -State Listen -LocalPort 8000,8100,8101 -ErrorAction Stop); " & _
	"$processes = @(Get-CimInstance Win32_Process -ErrorAction Stop); $processIds = New-Object 'System.Collections.Generic.HashSet[int]'; " & _
	"foreach ($connection in $connections) { [void]$processIds.Add([int]$connection.OwningProcess) }; " & _
	"foreach ($process in $processes) { if ($process.Name -in @('cmd.exe','node.exe') -and $process.CommandLine -and " & _
	"$process.CommandLine.IndexOf('" & escapedProjectPath & "', [StringComparison]::OrdinalIgnoreCase) -ge 0) { [void]$processIds.Add([int]$process.ProcessId) } }; " & _
	"$initialProcessIds = @($processIds); foreach ($processId in $initialProcessIds) { $current = $processes | " & _
	"Where-Object { $_.ProcessId -eq $processId } | Select-Object -First 1; " & _
	"while ($current -and $current.ParentProcessId -gt 0) { $parent = $processes | Where-Object { $_.ProcessId -eq $current.ParentProcessId } | Select-Object -First 1; " & _
	"if ($parent -and $parent.Name -in @('cmd.exe','node.exe')) { [void]$processIds.Add([int]$parent.ProcessId) }; $current = $parent } }; " & _
	"$rootProcessIds = @($processIds); foreach ($processId in $rootProcessIds) { $process = $processes | " & _
	"Where-Object { $_.ProcessId -eq $processId } | Select-Object -First 1; " & _
	"if ($process -and $process.Name -notin @('cmd.exe','node.exe','python.exe','pythonw.exe')) { " & _
	"throw ('Proceso no reconocido {0} (PID {1}) corresponde a una instancia de AdminSys.' -f $process.Name, $processId) } }; " & _
	"foreach ($processId in $rootProcessIds) { Stop-AdminSysProcessTree $processId $processes } }; " & _
	"if ($mutex.WaitOne(0)) { try { if (Test-AdminSysRunning) { exit }; " & _
	"& '" & escapedBatchPath & "'; " & _
	"Add-Type -AssemblyName System.Windows.Forms; Add-Type -AssemblyName System.Drawing; " & _
	"$trayMenu = New-Object System.Windows.Forms.ContextMenuStrip; " & _
	"$closeItem = $trayMenu.Items.Add('Cerrar AdminSys'); " & _
	"$tray = New-Object System.Windows.Forms.NotifyIcon; $tray.Icon = [System.Drawing.SystemIcons]::Application; " & _
	"$tray.Text = 'AdminSys - Sistema de Ventas'; $tray.ContextMenuStrip = $trayMenu; $tray.Visible = $true; " & _
	"$form = New-Object System.Windows.Forms.Form; $form.Text = 'AdminSys'; $form.Width = 380; $form.Height = 120; " & _
	"$form.StartPosition = 'CenterScreen'; $form.FormBorderStyle = 'FixedDialog'; $form.ControlBox = $false; " & _
	"$label = New-Object System.Windows.Forms.Label; $label.Dock = 'Fill'; $label.TextAlign = 'MiddleCenter'; " & _
	"$label.Text = 'AdminSys is starting. Waiting for open in browser...'; $form.Controls.Add($label); " & _
	"$state = @{ ShutdownRequested = $false; Form = $form; AppContext = $null }; " & _
	"$closeHandler = { try { Stop-AdminSysInstances; $state.ShutdownRequested = $true; $state.Form.Close(); " & _
	"if ($state.AppContext) { $state.AppContext.ExitThread() } } catch { " & _
	"[void][System.Windows.Forms.MessageBox]::Show(('No se pudieron cerrar todas las instancias: ' + $_.Exception.Message), " & _
	"'AdminSys', [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Error) } }.GetNewClosure(); " & _
	"$closeItem.Add_Click($closeHandler); " & _
	"$timer = New-Object System.Windows.Forms.Timer; $timer.Interval = 1000; $deadline = (Get-Date).AddSeconds(60); " & _
	"$timer.Add_Tick({ if (Test-AdminSysReady) { $timer.Stop(); $form.Close() } " & _
	"elseif ((Get-Date) -ge $deadline) { $timer.Stop(); $label.Text = 'AdminSys did not start on localhost:8000.'; " & _
	"Start-Sleep -Seconds 5; $form.Close() } }); $timer.Start(); [void]$form.ShowDialog(); $timer.Dispose(); $form.Dispose(); " & _
	"if (-not $state.ShutdownRequested -and (Test-AdminSysRunning)) { " & _
	"$appContext = New-Object System.Windows.Forms.ApplicationContext; $state.AppContext = $appContext; " & _
	"$monitor = New-Object System.Windows.Forms.Timer; $monitor.Interval = 2000; " & _
	"$monitor.Add_Tick({ if (-not (Test-AdminSysRunning)) { $tray.Visible = $false; $appContext.ExitThread() } }); " & _
	"$monitor.Start(); [System.Windows.Forms.Application]::Run($appContext); $monitor.Stop(); $monitor.Dispose() }; " & _
	"$tray.Visible = $false; $tray.Dispose(); $trayMenu.Dispose(); " & _
	"} finally { $mutex.ReleaseMutex(); $mutex.Dispose() } }"

ws.Run "powershell.exe -NoProfile -WindowStyle Hidden -Command """ & psCommand & """", 0, False