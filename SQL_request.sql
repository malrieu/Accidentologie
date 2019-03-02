# Nombre d'accidents par année
SELECT COUNT( `Num_Acc` ) AS `nb_accidents` , `an`
FROM `cara`
GROUP BY `an` 

# Nombre d'accidents par type de route
SELECT COUNT( `Num_Acc` ) AS `nb_accidents` , `catr`
FROM `lieu`
WHERE `catr` NOT LIKE '0'
GROUP BY `catr` 

# Nombre d'accidents par type de conditions météo
SELECT COUNT( `Num_Acc` ) AS `nb_accidents` , `atm`
FROM `cara`
WHERE `atm` NOT LIKE '0'
GROUP BY `atm` 

# Nombre d'accidents par type de gravité
SELECT COUNT( DISTINCT `Num_Acc` ) AS `nb_accidents` , `grav`
FROM `usag`
GROUP BY `grav` 