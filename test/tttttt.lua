o = {}



function random(n, m)
    math.randomseed(os.clock()*math.random(1000000,90000000)+math.random(1000000,90000000))
    return math.random(n, m)
end

function randomLetter(len)
    local rt = ""
    for i = 1, len, 1 do
        rt = rt..string.char(random(97,122))
    end
    return rt
end


o._new = function(f, r)
    local hash = randomLetter(8)
    o[hash] = {}
    o[hash].f = loadstring(f)
    o[hash].r = loadstring(r)
    return hash
end


o._del = function(hash)
    o[hash] = nil
end




l = o._new("print('ff')", "print('rr')")

o[l].f()




