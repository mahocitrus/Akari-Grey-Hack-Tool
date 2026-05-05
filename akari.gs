//@author AkazaAkari
//@version indev 0.0.3
//@name smartNPChackingTool
//@description
// Try to get you root shell on any npc public ip and local ip you input.
// If it fails it will give you suggestions for you.
// Simplify PvE gameplay.
//@updates
// 0.0.1
// 0.0.2 rewrote nmap
// 0.0.3 added open rshell support, wipe system no longer deletes anything, added local escalate, minor bug fixes.
// 0.0.4 added metaxploit.rshell_server support

if params and params.len < 2 then exit(program_path.split("/")[-1] + " [public_ip] [local_ip]")

getCloudExploitAPI = function(metaxploit) //rocketorbit's exploit database api.
    recursiveCheck = function(anyObject, maxDepth = -1)
        if maxDepth == 0 then return true
        if @anyObject isa map or @anyObject isa list then
            for key in indexes(@anyObject)
                if not recursiveCheck(@key, maxDepth - 1) then return false
            end for
            for val in values(@anyObject)
                if not recursiveCheck(@val, maxDepth - 1) then return false
            end for
        end if
        if @anyObject isa funcRef then return false
        return true
    end function
    if typeof(metaxploit) != "MetaxploitLib" then return print("metaxploit required for api to work.")
    netSession = metaxploit.net_use(nslookup("www.ExploitDatabase.org"), 22) //connect to server with metaxploit on ssh service
    if netSession then metaLib = netSession.dump_lib else metaLib = null
    if metaLib then remoteShell = metaLib.overflow("0xF8E54A6", "becolo") else remoteShell = null //exploit needed to grab a guest shell to the server
    if typeof(remoteShell) != "shell" then print("Server failed. API running in local mode.")
    
    clearInterface = function(interface)
        for k in indexes(interface)
            if @k == "classID" or @k == "__isa" then continue
            remove(interface, @k)
        end for
        if not recursiveCheck(@interface) then exit("<color=red>WARNING, API MAY HAVE BEEN POISONED, ABORTING.</color>")
        return null
    end function

    api = {}
    api.classID = "api"
    api.connection = remoteShell
    api.metaxploit = metaxploit
    api.interface = get_custom_object

    //all api method start
    api.testConnection = function(self) //demo method.
        clearInterface(self.interface)
        if typeof(self.connection) != "shell" then return false
        self.interface.ret = null
        self.interface.args = ["testConnection"]
        self.connection.launch("/interfaces/exploitAPI")
        if not hasIndex(self.interface, "ret") then return not (not clearInterface(self.interface)) //not (not) is for casting null to false, false to false, empty set to false, everything else to true.
        if @self.interface.ret isa funcRef or @self.interface.ret isa map then return not (not clearInterface(self.interface))
        ret = not (not @self.interface.ret)
        clearInterface(self.interface)
        return ret
    end function
    api.scanMetaLib = function(self, metaLib)
        clearInterface(self.interface)
        self.interface.ret = null
        self.interface.args = ["scanMetaLib", metaLib]
        if typeof(self.connection) == "shell" then self.connection.launch("/interfaces/exploitAPI")
        print("IF YOU SEE ANY WEIRD OUTPUT ABOVE (ESPECIALLY OVERFLOW PROMPT), OR IF YOUR TERMINAL WAS CLEARED (OUTPUT SHOULD ONLY BE A PROGRESS BAR, NOTHING MORE NOTHING LESS), IT MEANS THE SERVER WAS HACKED AND YOU NEED TO STOP USING THIS API RIGHT NOW, AND CONTACT DISCORD:rocketorbit IMMEDIATELY.")
        if hasIndex(self.interface, "ret") and @self.interface.ret != null and recursiveCheck(@self.interface.ret) then
            ret = @self.interface.ret
            clearInterface(self.interface)
            return ret
        end if
        clearInterface(self.interface)
        print("Server failed. Using local scan.")
        ret = {}
        ret.lib_name = lib_name(@metaLib)
        ret.version = version(@metaLib)
        ret.memorys = {}
        memorys = self.metaxploit.scan(@metaLib)
        for memory in memorys
            addresses = split(self.metaxploit.scan_address(@metaLib, memory), "Unsafe check:")
            ret.memorys[memory] = []
            for address in addresses
                if address == addresses[0] then continue
                value = address[indexOf(address, "<b>") + 3:indexOf(address, "</b>")].replace("\n", "")
                ret.memorys[memory] = ret.memorys[memory] + [value]
            end for
        end for
        return ret
    end function
    api.queryExploit = function(self, libName, libVersion)
        clearInterface(self.interface)
        if typeof(self.connection) != "shell" then return null
        self.interface.ret = null
        self.interface.args = ["queryExploit", libName, libVersion]
        self.connection.launch("/interfaces/exploitAPI")
        if not hasIndex(self.interface, "ret") then return clearInterface(self.interface)
        if not recursiveCheck(@self.interface.ret) then return clearInterface(self.interface)
        ret = @self.interface.ret
        clearInterface(self.interface)
        return ret
    end function
    api.getHashes = function(self)
        clearInterface(self.interface)
        if typeof(self.connection) != "shell" then return null
        self.interface.ret = null
        self.interface.args = ["getHashes"]
        self.connection.launch("/interfaces/exploitAPI")
        if not hasIndex(self.interface, "ret") then return clearInterface(self.interface)
        if not recursiveCheck(@self.interface.ret) then return clearInterface(self.interface)
        ret = @self.interface.ret
        clearInterface(self.interface)
        return ret
    end function
    //all api method end

    if not api.testConnection then print("unable to reach server. API is in local mode.")

    return api
end function

getRshellAPI = function(metaxploit)
    recursiveCheck = function(anyObject, maxDepth = -1)
        if maxDepth == 0 then return true
        if @anyObject isa map or @anyObject isa list then
            for key in indexes(@anyObject)
                if not recursiveCheck(@key, maxDepth - 1) then return false
            end for
            for val in values(@anyObject)
                if not recursiveCheck(@val, maxDepth - 1) then return false
            end for
        end if
        if @anyObject isa funcRef then return false
        return true
    end function
    if typeof(metaxploit) != "MetaxploitLib" then return print("metaxploit required for api to work.")
    netSession = metaxploit.net_use(nslookup("www.OpenRshell.org"), 22) //connect to server with metaxploit on ssh service
    if netSession then metaLib = netSession.dump_lib else metaLib = null
    if metaLib then remoteShell = metaLib.overflow("0xF8E54A6", "becolo") else remoteShell = null //exploit needed to grab a guest shell to the server
    if typeof(remoteShell) != "shell" then print("Server failed. API running in local mode.")
    
    clearInterface = function(interface)
        for k in indexes(interface)
            if @k == "classID" or @k == "__isa" then continue
            remove(interface, @k)
        end for
        if not recursiveCheck(@interface) then exit("<color=red>WARNING, API MAY HAVE BEEN POISONED, ABORTING.</color>")
        return null
    end function

    api = {}
    api.classID = "api"
    api.connection = remoteShell
    api.metaxploit = metaxploit
    api.interface = get_custom_object

    //all api method start
    api.testConnection = function(self) //demo method.
        clearInterface(self.interface)
        if typeof(self.connection) != "shell" then return false
        self.interface.ret = null
        self.interface.args = ["testConnection"]
        self.connection.launch("/interfaces/rshellAPI")
        if not hasIndex(self.interface, "ret") then return not (not clearInterface(self.interface)) //not (not) is for casting null to false, false to false, empty set to false, everything else to true.
        if @self.interface.ret isa funcRef or @self.interface.ret isa map then return not (not clearInterface(self.interface))
        ret = not (not @self.interface.ret)
        clearInterface(self.interface)
        return ret
    end function
    api.getRshells = function(self, publicIp)
        clearInterface(self.interface)
        if typeof(self.connection) != "shell" then return null
        self.interface.ret = null
        self.interface.args = ["getRshells", publicIp]
        self.connection.launch("/interfaces/rshellAPI")
        if not hasIndex(self.interface, "ret") then return clearInterface(self.interface)
        if @self.interface.ret isa map then return clearInterface(self.interface)
        if not recursiveCheck(@self.interface.ret, 3) then return clearInterface(self.interface) //this is for shell object back passing only. do not access its method, when using the shell object, use host_computer(@shell) instead of shell.host_computer!
        ret = @self.interface.ret
        if ret isa list then
            for shell in ret
                if not host_computer(@shell) then return clearInterface(self.interface)
            end for
        else
            if not recursiveCheck(ret) then return clearInterface(self.interface)
        end if
        clearInterface(self.interface)
        return ret
    end function
    //all api method end

    if not api.testConnection then print("unable to reach server. API is in local mode.")

    return api
end function

printNmapInfo = function(targetIp) //nmap from rocShell.
    if not is_valid_ip(targetIp) then targetIp = nslookup(targetIp)
    if not is_valid_ip(targetIp) then return print("Invalid ip.")
    if is_lan_ip(targetIp) then router = current.router else router = get_router(targetIp)
    toPrint = "<b>" + router.essid_name + " (" + router.bssid_name + ")</b>\nPublic IP: <b>" + router.public_ip + "</b>  Private IP: <b>" + router.local_ip + "\n\nkernel_router.so v<b>" + router.kernel_version + "</b>\n\nWhois info:\n" + whois(router.public_ip).replace(char(10), "\n</b>").replace(": ", ": <b>") + "</b>\n\nFirewall rules:\n" + format_columns((["ACTION PORT SOURCE_IP DESTINATION_IP"] + router.firewall_rules).join("\n")) + "\n\n" //nslookup, whois, scanrouter part.
    nmapInfo = "Exposed ports on router " + router.public_ip
    for port in router.used_ports
        if port.is_closed then accessible = "---       " else accessible = "ACCESSIBLE"
        portInfo = router.port_info(port).split(" ")
        portNumber = port.port_number + ""
        nmapInfo = nmapInfo + "\n" + char(9) + accessible + " " + portNumber + (" " * (6 - portNumber.len)) + portInfo[0] + (" " * (13 - portInfo[0].len)) + portInfo[1] + (" " * (8 - portInfo[1].len)) + port.get_lan_ip
    end for
    forwardedPorts = router.used_ports
    for i in forwardedPorts.indexes
        forwardedPorts[i] = forwardedPorts[i].get_lan_ip + router.port_info(forwardedPorts[i])
    end for
    nmapInfo = nmapInfo + "\n\nScaning all machines..."
    if is_lan_ip(targetIp) then lanIps = [targetIp] else lanIps = router.devices_lan_ip.sort
    if lanIps.indexOf(router.local_ip) then
        lanIps.remove(lanIps.indexOf(router.local_ip))
        lanIps = [router.local_ip] + lanIps
    end if
    for lanIp in lanIps
        nmapInfo = nmapInfo + "\nMachine at <b>" + lanIp + "</b>"
        ports = router.device_ports(lanIp)
        if not ports isa list then
            nmapInfo = nmapInfo + "\n" + char(9) + "<i>IP UNREACHABLE</i>"
            continue
        end if
        portsInfo = ""
        for port in ports
            if forwardedPorts.indexOf(port.get_lan_ip + router.port_info(port)) != null then exposed = "EXPOSED" else exposed = "---    "
            if is_lan_ip(targetIp) or ((not port.is_closed) and exposed == "EXPOSED") then accessible = "ACCESSIBLE" else accessible = "---       "
            portInfo = router.port_info(port).split(" ")
            portNumber = port.port_number + ""
            portsInfo = portsInfo + "\n" + char(9) + exposed + " " + accessible + " " + portNumber + (" " * (6 - portNumber.len)) + portInfo[0] + (" " * (13 - portInfo[0].len)) + portInfo[1] + (" " * (8 - portInfo[1].len)) + port.get_lan_ip
        end for
        if ports then nmapInfo = nmapInfo + portsInfo else nmapInfo = nmapInfo + "\n" + char(9) + "<i>No ports detected.</i>"
    end for
    toPrint = toPrint + nmapInfo
    print(toPrint)
end function

metaxploit = include_lib(current_path + "/metaxploit.so")
if not metaxploit then metaxploit = include_lib("/lib/metaxploit.so")
if not metaxploit then exit("Error: Missing metaxploit library")

crypto = include_lib(current_path + "/crypto.so")
if not crypto then crypto = include_lib("/lib/metaxploit.so")
if not crypto then print("Warning: Missing crypto library")

rshellAPI = getRshellAPI(metaxploit)

api = getCloudExploitAPI(metaxploit)

hashMap = api.getHashes
if not hashMap then hashMap = {}

crack = function(passes) //hash from rocShell, modified.
    hashes = []
    passes = passes.split(char(10))
    for i in passes.indexes
        passes[i] = passes[i].split(",")
        for j in passes[i].indexes
            passes[i][j] = passes[i][j].split(";")
            for k in passes[i][j].indexes
                hashes = hashes + [passes[i][j][k]]
            end for
        end for
    end for
    ret = []
    for hsh in hashes
        hsh = hsh.split(":")
        if hsh.len > 0 then arg = hsh[0]
        if hsh.len > 1 then arg = hsh[1]
        line = ""
        if hashMap.hasIndex(arg) then line = hashMap[arg]
        if (not line) and crypto then line = crypto.decipher(arg)
        if hsh.len > 1 then line = hsh[0] + ":" + line
        ret.push(line)
    end for
    return ret
end function

toFile = function(anyObject) //toFile from rocShell
    if typeof(anyObject) == "shell" then return anyObject.host_computer.File("/")
    if typeof(anyObject) == "computer" then return anyObject.File("/")
    if typeof(anyObject) == "file" then
        while anyObject.parent
            anyObject = anyObject.parent
        end while
        return anyObject
    end if
    return null
end function

checkAccess = function(fileObject) //checkAccess from rocShell
    if not typeof(fileObject) == "file" then return null
    while fileObject.parent
        fileObject = fileObject.parent
    end while
    homeFolder = null
    for folder in fileObject.get_folders
        if folder.name == "root" then
            if folder.has_permission("w") and folder.has_permission("r") and folder.has_permission("x") then return "root"
        end if
        if folder.name == "home" then
            homeFolder = folder
        end if
    end for
    if not homeFolder then return "guest"
    for folder in homeFolder.get_folders
        if folder.name == "guest" then continue
        if folder.has_permission("w") and folder.has_permission("r") and folder.has_permission("x") then return folder.name
    end for
    return "guest"
end function

getMails = function(fileObject)
    while fileObject.parent
        fileObject = fileObject.parent
    end while
    ret = []
    for homeFolder in fileObject.get_folders
        if homeFolder.name != "home" then continue
        for user in homeFolder.get_folders
            if user.name == "guest" then continue
            for configFolder in user.get_folders
                if configFolder.name != "Config" then continue
                for file in configFolder.get_files
                    if file.name != "Mail.txt" then continue
                    ret = ret + crack(file.get_content)
                    break
                end for
                break
            end for
        end for
        break
    end for
    return ret
end function

getPasswords = function(fileObject)
    while fileObject.parent
        fileObject = fileObject.parent
    end while
    ret = []
    for folder in fileObject.get_folders
        if folder.name != "etc" then continue
        for file in folder.get_files
            if file.name != "passwd" then continue
            ret = crack(file.get_content.trim)
            break
        end for
        break
    end for
    return ret
end function

toComputer = function(anyObject)
    if not [null, "shell", "computer"].indexOf(typeof(anyObject)) then return null
    if typeof(anyObject) == "shell" then return anyObject.host_computer
    return anyObject
end function

reversed = function(anyList)
    if not anyList isa list then return null
    anyList = anyList[0:]
    i = 0
    j = anyList.len - 1
    while i < j
        tmp = anyList[i]
        anyList[i] = anyList[j]
        anyList[j] = tmp
        i = i + 1
        j = j - 1
    end while
    return anyList
end function

printFileSystem = function(fileObject)
    while fileObject.parent
        fileObject = fileObject.parent
    end while
    stack = [fileObject]
    ret = []
    while stack
        currentObject = stack.pop
        for file in currentObject.get_folders + currentObject.get_files
            type = "txt"
            if file.is_binary == 1 then type = "bin"
            if file.is_folder == 1 then type = "fld"
            WRX = ""
            if file.has_permission("w") then WRX = WRX + "w" else WRX = WRX + "-"
            if file.has_permission("r") then WRX = WRX + "r" else WRX = WRX + "-"
            if file.has_permission("x") then WRX = WRX + "x" else WRX = WRX + "-"
            ret.push([file.path, type, WRX, file.size, file.permissions, file.owner, file.group].join(" "))
        end for
        if not currentObject.is_folder then continue
        for folder in reversed(currentObject.get_folders)
            stack.push(folder)
        end for
    end while
    print(format_columns(ret.join(char(10))))
    return ret
end function

wipeSystem = function(fileObject)
    while fileObject.parent
        fileObject = fileObject.parent
    end while
    for file in fileObject.get_folders + fileObject.get_files
        file.rename("__" + file.name)
    end for
end function

actions = function(result, targetPublicIp, port, targetLocalIp, k, v)
    resultType = typeof(result)
    if not [null, "shell", "computer", "file"].indexOf(resultType) then return null
    if port == 0 and router.local_ip != targetLocalIp and resultType != "computer" then return null
    permission = checkAccess(toFile(result))
    print("Got " + permission + " " + resultType + " access!")
    print("File system overview.")
    printFileSystem(toFile(result))
    print("Try to use other tools like rocShell for a shell-like interface.")
    print("exploit info: " + [targetPublicIp, port, targetLocalIp, k, v].join(" "))
    print("mail info for SE attack:" + char(10) + char(9) + getMails(toFile(result)).join(char(10) + char(9)))
    if [null, "shell", "computer"].indexOf(resultType) then print("ps info:" + char(10) + format_columns(toComputer(result).show_procs))
    if permission != "guest" then print("passwords for escalation:" + char(10) + char(9) + getPasswords(toFile(result)).join(char(10) + char(9)))
    print("If you did not get a shell, try openRshell.")
    if resultType == "shell" and permission == "root" then user_input("root shell obtained! press enter to start terminal, press Ctrl+C to abort.") + result.start_terminal
    if resultType == "shell" then
        print("Got " + permission + " shell, trying to escalate.")
        result.host_computer.touch("/home/" + permission, "dddd.src")
        result.host_computer.File("/home/" + permission + "/dddd.src").set_content(payload)
        result.build("/home/" + permission + "/dddd.src", "/home/" + permission)
        get_custom_object.hashes = hashMap.values
        get_custom_object.ret = null
        result.launch("/home/" + permission + "/dddd")
        if typeof(get_custom_object.ret) == "shell" then return actions(get_custom_object.ret, targetPublicIp, port, targetLocalIp, "local", "escalate")
        print("escalate failed.")
    end if
    if permission == "root" then
        print("Without a shell object you usually can not finish a mission.")
        print("However you can enter Y to wipe this system if you are doing a corrupt data mission. (This does not actually delete anything, only rename them. Find and delete will fail, do not use wipe for find and delete.)")
        choice = user_input("y/N> ").lower
        if choice == "y" then
            wipeSystem(toFile(result))
            exit("Wiped system. script ends.")
        end if
        print("All info gathered. Try openRshell to get a shell access.")
    end if
    return user_input("Press enter to continue.")
end function

payload = "
hashes = get_custom_object.hashes
get_custom_object.ret = null
for hsh in hashes
    shell = get_shell(""root"", hsh)
    if typeof(shell) != ""shell"" then continue
    get_custom_object.ret = shell
    exit(hsh)
end for
"

if not params then
    print("You have not specify public_ip and local_ip, by leaving them both empty you are entering local escalate mode. Enter Y to use local escalate mode.")
    choice = user_input("y/N> ").lower
    if choice != "y" then exit("Exiting. Correct usage: " + program_path.split("/")[-1] + " [public_ip] [local_ip]")
    shell = get_shell
    shell.host_computer.touch(current_path, "dddd.src")
    shell.host_computer.File(current_path + "/dddd.src").set_content(payload)
    shell.build(current_path + "/dddd.src", current_path)
    get_custom_object.hashes = hashMap.values
    get_custom_object.ret = null
    shell.launch(current_path + "/dddd")
    if typeof(get_custom_object.ret) == "shell" then actions(get_custom_object.ret, shell.host_computer.public_ip, "local", shell.host_computer.local_ip, "local", "escalate")
    for file in get_files(shell.host_computer.File("/lib"))
        metaLib = metaxploit.load(file.path)
        if not metaLib then continue
        exploits = api.queryExploit(metaLib.lib_name, metaLib.version)
        if not exploits then exploits = api.scanMetaLib(metaLib)
        if not exploits then continue
        for e in exploits.memorys
            for value in e.value
                result = metaLib.overflow(e.key, value, shell.host_computer.local_ip)
                actions(result, shell.host_computer.public_ip, file.path, shell.host_computer.local_ip, e.key, value)
            end for
        end for
    end for
    exit("escalate failed.")
end if

targetPublicIp = params[0]
targetLocalIp = params[1]
printNmapInfo(targetPublicIp)
for rshell in rshellAPI.getRshells(targetPublicIp)
    if typeof(rshell) != "shell" then continue
    if rshell.host_computer.local_ip != targetLocalIp then continue
    print("Got open rshell connection!")
    actions(rshell, targetPublicIp, "rshell", targetLocalIp, "open", "rshell")
end for
if typeof(metaxploit.rshell_server) == "list" then
    for rshell in metaxploit.rshell_server
        if typeof(rshell) != "shell" then continue
        if rshell.host_computer.local_ip != targetLocalIp then continue
        print("Got local rshell connection!")
        actions(rshell, targetPublicIp, "rshell", targetLocalIp, "local", "rshell")
    end for
end if
router = get_router(targetPublicIp)
if not router then exit("ip invalid!")
targetPorts = [0]
for port in router.used_ports
    if port.get_lan_ip == targetLocalIp then targetPorts.push(port.port_number)
end for
for port in targetPorts
    netSession = metaxploit.net_use(targetPublicIp, port)
    if not netSession then continue
    metaLib = netSession.dump_lib
    if not metaLib then continue
    exploits = api.queryExploit(metaLib.lib_name, metaLib.version)
    if not exploits then exploits = api.scanMetaLib(metaLib)
    if not exploits then continue
    for e in exploits.memorys
        for value in e.value
            result = metaLib.overflow(e.key, value, targetLocalIp)
            actions(result, targetPublicIp, port, targetLocalIp, e.key, value)
        end for
    end for
end for
print
print("It seems like you did not get a shell from the target. No problem, the tool have openRshell support built-in. Let me check openRshell for you.")
if not rshellAPI.testConnection then exit("Bad luck, openRshell service is down.")
print("openRshell service is online! IP is " + nslookup("www.OpenRshell.org"))
print("If you do not know what openRshell is yet, it is a service that allows you to use rshell to hack NPCs without setting up your own rshell server.")
print("All you have to do is to scroll above and try to find two mails. You log into one of them and send funny game to another, IP is <b>" + nslookup("www.OpenRshell.org") + "</b>, port is <b>1222</b>.")
print("If you have your own rshell server, you can also send funny game mail with your own rshell server ip, and run this tool from that server.")
print("After you send the mail, reply should say things like ""I just ran it"", after you see that, run this tool again, I will try catch the rshell connection for you. Good luck, see you later.")
print