# 1
def convert_base(number, from_base, to_base):
    decimal = 0
    for digit in number.upper():
        if digit.isalpha():
            value = ord(digit) - ord("A") + 10
        else:
            value = int(digit)
        decimal = decimal * from_base + value

    if to_base == 10:
        return str(decimal)

    result = ""
    while decimal > 0:
        remainder = decimal % to_base
        if remainder > 9:
            result = chr(ord("A") + remainder - 10) + result
        else:
            result = str(remainder) + result
        decimal //= to_base

    return result if result else "0"


def convert_base_input():
    number = input("number: ")
    from_base = int(input("original base: "))
    to_base = int(input("target base: "))
    result = convert_base(number, from_base, to_base)
    print(result)


# 2
def convert_to_bin_negative(num, number_of_bits):
    num = 2**number_of_bits + num
    result = ""
    for i in range(number_of_bits):
        result = str(num % 2) + result
        num = num // 2
    return result


def convert_base_negative_input():
    num = int(input("number: "))
    number_of_bits = int(input("number of bits: "))
    result = convert_to_bin_negative(num, number_of_bits)
    print(result)


convert_base_negative_input()
